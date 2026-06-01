import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog'; // DODANO MatDialog
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { EventItem } from '../../../models/event.model';
import { AuthService } from '../../../shared/services/auth.service';
import { EventService } from '../../../shared/services/event.service';
import { Router } from '@angular/router';
import { AddEventComponent } from '../add-event/add-event.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-details-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule,
    ImageUrlPipe,
    TranslateModule
  ],
  templateUrl: './event-details-dialog.component.html',
  styleUrls: ['./event-details-dialog.component.css']
})
export class EventDetailsDialogComponent implements OnInit {
  currentUserId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<EventDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public event: EventItem,
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserProfileId ? this.authService.getCurrentUserProfileId() : this.authService.getCurrentUserProfileId();
  }

  get isOwner(): boolean {
    return this.currentUserId === this.event.authorId;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  toggleInterest(): void {
    if (this.isOwner) return;

    if (!this.authService.isLoggedIn()) {
      this.dialogRef.close();
      this.router.navigate(['user/login']);
      return;
    }

    const currentEvent = this.event;
    if (!currentEvent) return;

    const oldStatus = currentEvent.isInterested;
    const newStatus = !oldStatus;
    
    currentEvent.isInterested = newStatus;
    currentEvent.interestCount += newStatus ? 1 : -1;

    this.eventService.setInterest(currentEvent.id, newStatus).subscribe({
      error: (err: any) => {
        console.error("Błąd podczas aktualizacji zainteresowania", err);
        currentEvent.isInterested = oldStatus;
        currentEvent.interestCount += oldStatus ? 1 : -1;
      }
    });
  }

  onEdit(): void {
    const dialogRef = this.dialog.open(AddEventComponent, {
      width: '600px',
      data: this.event
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.dialogRef.close(true); 
      }
    });
  }
}