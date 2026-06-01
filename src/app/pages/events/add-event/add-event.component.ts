import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../../../shared/services/event.service';
import { EventItem } from '../../../models/event.model';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ImageUrlPipe,
    TranslateModule
  ],
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isEditMode = false;
  isSubmitting = false;
  isDragOver = false;

  categories = [
    { id: 1, name: 'Muzyka' },
    { id: 2, name: 'Sport' },
    { id: 3, name: 'Edukacja' },
    { id: 4, name: 'Kultura' }
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    public dialogRef: MatDialogRef<AddEventComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: EventItem
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: [1, Validators.required],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      city: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.isEditMode = true;
      this.populateForm(this.data);
    }
  }

  populateForm(event: EventItem): void {
    // Funkcja pomocnicza: Obsługuje zarówno Date jak i string z backendu
    const formatForInput = (val: Date | string) => {
      if (!val) return '';
      const date = typeof val === 'string' ? new Date(val) : val;
      const localDate = new Date(date);
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
      return localDate.toISOString().slice(0, 16);
    };

    this.form.patchValue({
      title: event.title,
      description: event.description,
      categoryId: this.mapCategoryNameToId(event.category),
      startDateTime: formatForInput(event.startTime),
      endDateTime: formatForInput(event.endTime),
      city: event.city,
      price: event.price
    });

    if (event.imageUrl) {
      this.previewUrl = event.imageUrl;
    }
  }

  mapCategoryNameToId(name: string): number {
    const cat = this.categories.find(c => c.name === name);
    return cat ? cat.id : 1;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  private handleFile(file: File): void {
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string; // Tutaj uzyskujemy Base64
      };
      reader.readAsDataURL(file);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      const val = this.form.value;

      // ZMIANA: Budujemy obiekt JSON zamiast FormData
      const eventData: any = {
        Id: this.isEditMode && this.data ? this.data.id : 0,
        Title: val.title,
        Description: val.description,
        CategoryId: Number(val.categoryId),
        StartTime: new Date(val.startDateTime).toISOString(),
        EndTime: new Date(val.endDateTime).toISOString(),
        City: val.city,
        Price: Number(val.price),
        Latitude: this.data?.latitude || 52.2297,
        Longitude: this.data?.longitude || 21.0122,
        
        // Wysyłamy stary URL, aby backend wiedział, że nic się nie zmieniło, 
        // jeśli użytkownik nie wybrał nowego pliku.
        ImageUrl: this.data?.imageUrl || '' 
      };

      // Jeśli wybrano nowe zdjęcie, `previewUrl` zawiera ciąg Base64.
      // Wysyłamy go w polu ImageBase64.
      if (this.selectedFile && this.previewUrl) {
        eventData.ImageBase64 = this.previewUrl;
      }

      // Wysyłamy żądanie (Angular automatycznie ustawi Content-Type: application/json)
      const request$ = (this.isEditMode && this.data)
        ? this.eventService.updateEvent(this.data.id, eventData)
        : this.eventService.addEvent(eventData);

      request$.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Błąd:', err);
          this.isSubmitting = false;
        }
      });
    }
  }
}