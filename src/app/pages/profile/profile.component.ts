import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { EventCardMiniComponent } from '../../shared/components/event-card-mini/event-card-mini.component';
import { EventItem } from '../../models/event.model';
import { EventDetailsDialogComponent } from '../events/event-details-dialog/event-details-dialog.component';
import { FindFriendsDialogComponent } from './find-friends-dialog/find-friends-dialog.component';
import { UserProfileService } from '../../shared/services/user-profile.service';
import { AuthService } from '../../shared/services/auth.service';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    EventCardMiniComponent,
    ImageUrlPipe,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  currentUser: any = null;
  friends: any[] = [];
  createdEvents: EventItem[] = [];
  interestedEvents: EventItem[] = [];
  isFollowing: boolean = false;
  isSidebarOpen: boolean = false;
  SentRequests : string[] = [];
  allEvents: EventItem[] = []; 
  pendingRequests: any[] = [];   

  currentProfileId: number | null = null; 

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private dialog: MatDialog,
    private userProfileService : UserProfileService,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const paramId = params.get('id');
      let profileIdToLoad: number | null = null;

      if (paramId) {
        profileIdToLoad = Number(paramId);
      } else {
        profileIdToLoad = this.authService.getCurrentUserProfileId();
      }

      if (profileIdToLoad) {
        this.currentProfileId = profileIdToLoad;
        this.loadProfileData(profileIdToLoad);
      }
    });
  }

  loadProfileData(id: number) {
    this.userProfileService.getProfile(id).subscribe({
      next: (data) => {
        const isMe = id === this.authService.getCurrentUserProfileId();

        this.currentUser = {
          username: data.basicInfo.username,
          avatarUrl: ('https://i.pravatar.cc/300?u=' + data.basicInfo.username),
          friendsCount: data.friendsCount,
          eventsCount: data.eventsCount,
          isMe: isMe
        };

        this.friends = data.friends.map((f: any) => ({
             name: f.username,
             img: f.avatarUrl || ('https://i.pravatar.cc/150?u=' + f.username),
             id: f.id || '0'
        }));

        this.createdEvents = (data.events || []).map((e: any) => this.mapToEventItem(e));

        this.interestedEvents = (data.interestedEvents || []).map((e: any) => {
             const eventItem = this.mapToEventItem(e);
             if (isMe) {
                 eventItem.isInterested = true;
             }
             return eventItem;
        });

        if (isMe) {
            this.loadPendingRequests();
        }
      },
      error: (err) => console.error('Błąd pobierania profilu', err)
    });
  }

loadPendingRequests() {
    this.userProfileService.getPendingRequests().subscribe({
        next: (requests: any[]) => {
            this.pendingRequests = requests.map(r => ({
                id: r.id,
                sender: {
                    basicInfo: {
                        username: r.senderName,
                        avatarUrl: 'https://i.pravatar.cc/150?u=' + r.senderName
                    }
                }
            }));
        },
        error: (err) => console.error('Błąd pobierania zaproszeń', err)
    });
  }

  acceptRequest(requestId: number) {
    this.userProfileService.handleFriendRequest(requestId, true).subscribe({
        next: () => {
            this.loadPendingRequests();
            if (this.currentProfileId) {
                this.loadProfileData(this.currentProfileId);
            }
        },
        error: (err) => console.error('Błąd akceptacji', err)
    });
  }

  declineRequest(requestId: number) {
    this.userProfileService.handleFriendRequest(requestId, false).subscribe({
        next: () => {
            this.loadPendingRequests();
        },
        error: (err) => console.error('Błąd odrzucania', err)
    });
  }

  // ... (reszta metod: mapToEventItem, openEventDetails, etc. bez zmian) ...
  private mapToEventItem(apiEvent: any): EventItem {
     // ... Twoja obecna implementacja
     return {
         id: apiEvent.id,
         authorId: apiEvent.authorId,
         title: apiEvent.title,
         category: 'Inne', 
         city: apiEvent.city,
         price: apiEvent.price,
         latitude: apiEvent.latitude || 0,
         longitude: apiEvent.longitude || 0,
         startTime: new Date(apiEvent.startTime),
         endTime: apiEvent.endTime ? new Date(apiEvent.endTime) : new Date(apiEvent.startTime),
         popularity: apiEvent.trendingScore || 0,
         imageUrl: apiEvent.imageUrl,
         description: apiEvent.description,
         interestCount: apiEvent.interestCount,
         isInterested: apiEvent.isInterested
     };
  }

  openProfile(friendId: string) {
    this.router.navigate(['/profile', friendId]);
  }

  openEventDetails(event: EventItem) {
    // ... Twoja obecna implementacja
    const dialogRef = this.dialog.open(EventDetailsDialogComponent, {
      data: event,
      width: '600px', 
      maxWidth: '90vw', 
      panelClass: 'custom-dialog-container', 
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
            if (this.currentProfileId) {
                this.loadProfileData(this.currentProfileId);
            }
        } 
        else if (this.currentUser && this.currentUser.isMe) {
            this.interestedEvents = this.interestedEvents.filter(e => e.isInterested);
        }
    });
  }

  scrollList(element: HTMLElement, direction: 'left' | 'right') {
    const scrollAmount = 300;
    element.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  editProfile() {
    this.toggleSidebar();
  }

  searchFriends() {
    this.toggleSidebar();
    this.dialog.open(FindFriendsDialogComponent,{
        width: '450px',
        maxWidth: '90vw',
        autoFocus: true,
        data: {
            currentFriends: this.friends,
            sentRequests: this.SentRequests
        }
    });
  }

  accountSettings() {
    this.toggleSidebar();
  }

  onEventDeleted(eventId: number) {
    const wasInCreated = this.createdEvents.some(e => e.id === eventId);
    this.createdEvents = this.createdEvents.filter(e => e.id !== eventId);
    if (wasInCreated && this.currentUser) {
      this.currentUser.eventsCount = Math.max(0, this.currentUser.eventsCount - 1);
    }
  }

  logout(){
    this.authService.logout();
  }
}