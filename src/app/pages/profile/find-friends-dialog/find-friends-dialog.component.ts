import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; 
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserProfileService } from '../../../shared/services/user-profile.service';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { AuthService } from '../../../shared/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-find-friends-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    FormsModule,
    ImageUrlPipe,
    MatSnackBarModule,
    TranslateModule,
    MatTooltipModule 
  ],
  templateUrl: './find-friends-dialog.component.html',
  styleUrls: ['./find-friends-dialog.component.css']
})
export class FindFriendsDialogComponent implements OnInit {
  searchQuery: string = '';
  
  allUsers: any[] = [];
  foundUsers: any[] = [];
  
  isLoading = false;
  hasSearched = false;

  constructor(
    public dialogRef: MatDialogRef<FindFriendsDialogComponent>,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    const myId = this.authService.getCurrentUserProfileId();

    this.userProfileService.getAllUserProfiles().subscribe({
      next: (users) => {
        this.allUsers = users.filter(u => u.id !== myId);
        this.foundUsers = []; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd pobierania użytkowników', err);
        this.isLoading = false;
      }
    });
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.hasSearched = true;
    const query = this.searchQuery.toLowerCase();

    this.foundUsers = this.allUsers.filter(user => {
      const username = user.basicInfo?.username || '';
      const firstName = user.basicInfo?.firstName || '';
      const lastName = user.basicInfo?.lastName || '';
      const city = user.basicInfo?.city || '';

      return username.toLowerCase().includes(query) ||
             firstName.toLowerCase().includes(query) ||
             lastName.toLowerCase().includes(query) ||
             city.toLowerCase().includes(query);
    });
  }

  addFriend(userId: number) {
    this.userProfileService.sendFriendRequest(userId).subscribe({
      next: () => {
        this.translate.get(['FRIENDS_DIALOG.SENT_SUCCESS', 'COMMON.CLOSE']).subscribe(trans => {
             this.snackBar.open(trans['FRIENDS_DIALOG.SENT_SUCCESS'], trans['COMMON.CLOSE'], {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
        });

        this.foundUsers = this.foundUsers.filter(u => u.id !== userId);
        this.allUsers = this.allUsers.filter(u => u.id !== userId);
        
        if (this.foundUsers.length === 0) {
            this.searchQuery = '';
        }
      },
      error: (err) => {
        console.error(err);
        this.translate.get(['FRIENDS_DIALOG.ADD_ERROR', 'COMMON.CLOSE']).subscribe(trans => {
             this.snackBar.open(trans['FRIENDS_DIALOG.ADD_ERROR'], trans['COMMON.CLOSE'], {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
        });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}