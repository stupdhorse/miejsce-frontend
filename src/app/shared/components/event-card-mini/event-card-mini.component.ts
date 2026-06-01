import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EventItem } from '../../../models/event.model';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event-card-mini',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule,ImageUrlPipe,TranslateModule],
  templateUrl: './event-card-mini.component.html',
  styleUrls: ['./event-card-mini.component.css']
})
export class EventCardMiniComponent {
  @Input() event!: EventItem;
  @Input() fullWidth = false;
  @Output() deleted = new EventEmitter<number>();

  isOwner = false;

  constructor(
    private authService: AuthService,
    private eventService: EventService
  ) {}

  ngOnInit():void{
    const myId = this.authService.getCurrentUserProfileId();
    this.isOwner = (myId!==null && myId===this.event.authorId);
  }

  onDelete(e:MouseEvent){
    e.stopPropagation();

    if(confirm('Czy na pewno chcesz usunąć to wydarzenie?')){
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: ()=> {this.deleted.emit(this.event.id);},
        error: (err) => console.error('Błąd usuwania', err)
      });
    }
  }
}