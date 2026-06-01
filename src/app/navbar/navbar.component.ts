import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddEventComponent } from '../pages/events/add-event/add-event.component';
// IMPORT TranslateModule, Service i Eventu
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule,
    MatTooltipModule,
    TranslateModule 
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUrl: string = '';
  isLoggedIn: boolean = false;
  currentLang: string = 'en';
  private langSub: Subscription | undefined;

constructor(
    private router: Router, 
    private authService: AuthService, 
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || 'en';

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });
      
    this.langSub = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang = event.lang;
    });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('preferredLang', lang);
  }

  checkAuthStatus() {
    return this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  showAuthButtons(): boolean {
    return !this.currentUrl.startsWith('/user');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  openAddEvent() {
    this.dialog.open(AddEventComponent, {
      width: '800px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });
  }
}