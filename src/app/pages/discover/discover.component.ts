import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ApiEventResponse, EventItem } from '../../models/event.model';
import { EventCardMiniComponent } from "../../shared/components/event-card-mini/event-card-mini.component";
import { EventDetailsDialogComponent } from '../events/event-details-dialog/event-details-dialog.component';
import { EventService} from '../../shared/services/event.service';
import { AuthService } from '../../shared/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSliderModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule,
    EventCardMiniComponent, TranslateModule
  ],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  filterForm: FormGroup;
  isFilteredMode = false;
  isSidebarOpen = false;
  isLoading: boolean = true;
  isLoggedIn: boolean = false;

  allEvents: EventItem[] = [];
  trendingEvents: EventItem[] = [];
  
  categorizedEvents: { category: string, events: EventItem[] }[] = [];
  filteredEvents: EventItem[] = [];
  recommendedEvents: EventItem[] = []; // Ta tablica zostanie teraz wypełniona
  likedByFriendsEvents : EventItem[] = [];

  categoryMap: { [key: number]: string } = {
    1: 'Muzyka', 2: 'Sztuka', 3: 'Sport', 4: 'Jedzenie', 5: 'Teatr'
  };

  cities = ['Warszawa', 'Kraków', 'Poznań', 'Gdańsk', 'Wrocław'];
  categories = ['Muzyka', 'Sztuka', 'Sport', 'Jedzenie', 'Teatr'];
  sortOptions = [
    { value: 'price_asc', label: 'DISCOVER.SORT_PRICE_ASC' },
    { value: 'price_desc', label: 'DISCOVER.SORT_PRICE_DESC' },
    { value: 'popularity', label: 'DISCOVER.SORT_POPULARITY' },
    { value: 'date', label: 'DISCOVER.SORT_DATE' }
  ];
  selectedSort = 'popularity';

  constructor(
    private fb: FormBuilder, 
    private dialog: MatDialog,
    private eventService: EventService,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      categories: [[]],
      city: [''],
      dateFrom: [null],
      dateTo: [null],
      priceMax: [500],
      onlyFree: [false],
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isLoading = true;
    this.loadEvents();

    this.filterForm.valueChanges.subscribe(() => {
      this.isFilteredMode = true;
      this.applyFilters();
    });
  }

  loadEvents() {
    // 1. Pobierz WSZYSTKIE wydarzenia
    this.eventService.getAllEvents().subscribe({
      next: (apiData) => {
        this.allEvents = apiData.map(e => this.mapToEventItem(e));
        this.allEvents = this.sortEvents(this.allEvents, this.selectedSort);
        this.groupEventsByCategory();
        this.applyFilters();
        
        setTimeout(() => {
            this.isLoading = false; 
        }, 500);
      },
      error: () => this.isLoading = false
    });

    // 2. Pobierz TRENDY
    this.eventService.getTrendingEvents().subscribe({
      next: (apiData) => {
        this.trendingEvents = apiData.map(e => this.mapToEventItem(e));
      },
      error: (err) => console.error('Błąd pobierania trendów', err)
    });

    // 3. Pobierz REKOMENDOWANE (DODANO)
    this.eventService.getRecommendedEvents().subscribe({
      next: (apiData) => {
        this.recommendedEvents = apiData.map(e => this.mapToEventItem(e));
      },
      error: (err) => console.error('Błąd pobierania rekomendacji', err)
    });
  }

  private mapToEventItem(e: ApiEventResponse): EventItem {
    return {
      id: e.id,
      authorId: e.authorId,
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl || 'assets/placeholder.jpg',
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
      category: this.categoryMap[e.categoryId] || 'Inne',
      city: e.city,
      price: e.price,
      latitude: e.latitude,
      longitude: e.longitude,
      interestCount: e.interestCount,
      popularity: e.trendingScore,
      isTrending: e.trendingScore > 0,
      isInterested: e.isInterested
    };
  }

  groupEventsByCategory() {
    const groups = new Map<string, EventItem[]>();
    this.allEvents.forEach(event => {
      if (!groups.has(event.category)) {
        groups.set(event.category, []);
      }
      groups.get(event.category)?.push(event);
    });
    this.categorizedEvents = Array.from(groups, ([name, value]) => ({ category: name, events: value }));
  }

  onSortChange(value: string) {
    this.selectedSort = value;
    this.isFilteredMode = true; 
    this.applyFilters(); 
  }

  applyFilters() {
    const { categories, city, dateFrom, dateTo, priceMax, onlyFree, searchQuery } = this.filterForm.value;

    let tempEvents = this.allEvents.filter(event => {
      if (categories && categories.length > 0 && !categories.includes(event.category)) return false;
      if (city && event.city !== city) return false;
      if (dateFrom && event.startTime < dateFrom) return false;
      if (dateTo && event.startTime > dateTo) return false;
      if (onlyFree && event.price > 0) return false;
      if (!onlyFree && event.price > priceMax) return false;

      if (searchQuery){
        const eventText = (event.title + ' ' + (event.description || '')).toLowerCase();
        const searchTerms = searchQuery.toLowerCase().split(' ').filter((t: string)=>t.length>0);
        const matches = searchTerms.every((term:string)=>eventText.includes(term));
        if(!matches) return false;
      }

      return true;
    });

    tempEvents = this.sortEvents(tempEvents, this.selectedSort);
    this.filteredEvents = tempEvents;
  }

  sortEvents(events: EventItem[], sortType: string): EventItem[] {
    return events.sort((a, b) => {
      switch (sortType) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'popularity': return b.popularity - a.popularity;
        case 'date': return a.startTime.getTime() - b.startTime.getTime();
        default: return 0;
      }
    });
  }

  resetFilters() {
    this.filterForm.reset({ categories: [], city: '', priceMax: 500, onlyFree: false });
    this.selectedSort = 'popularity';
    this.isFilteredMode = false;
  }
  
  getMinDate() { return new Date(); }

  openEventDetails(event: EventItem) {
    const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
      data: event,
      width: '600px', 
      maxWidth: '90vw', 
      panelClass: 'custom-dialog-container', 
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
            this.loadEvents();
        }
    });
  }
  
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }

  scrollList(element: HTMLElement, direction: 'left' | 'right') {
    const scrollAmount = 300; 
    
    element.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  onEventDeleted(eventId: number) {
    this.allEvents = this.allEvents.filter(e => e.id !== eventId);
    this.trendingEvents = this.trendingEvents.filter(e => e.id !== eventId);
    this.recommendedEvents = this.recommendedEvents.filter(e => e.id !== eventId); // Aktualizacja rekomendowanych
    this.groupEventsByCategory();
    this.applyFilters();
  }
}