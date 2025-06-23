import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    MatFormFieldModule,   // <-- wymagany do <mat-form-field>
    MatInputModule,       // <-- wymagany do <input matInput>
    MatSelectModule,      // <-- wymagany do <mat-select>
    MatButtonModule,      // <-- wymagany do <button mat-button>
    MatIconModule,
    MatRadioModule,       // <-- wymagany do <mat-radio-group>
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
@ViewChild('carousel', { static: true }) carousel!: NgbCarousel;

  formStep1!: FormGroup;
  formStep2!: FormGroup;
  formStep3!: FormGroup;

  carouselIndex = 0;
  btnDisabled = false;

  constructor(private fb: FormBuilder,
              private service:AuthService
  ) {
    this.formStep1 = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.formStep2 = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*(),.?":{}|<>]).{8,}$/)
      ]],
    });
    this.formStep3 = this.fb.group({
      username: ['', Validators.required],
      day: ['',[Validators.required, Validators.min(1), Validators.max(31)]],
      month: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      gender: ['', Validators.required],
    });

  }

getStepTitle(): string {
    switch (this.carouselIndex) {
      case 0: return 'Step 1 of 3';
      case 1: return 'Step 2 of 3';
      case 2: return 'Step 3 of 3';
      default: return '';
    }
  }

onNext() {
  const currentForm = this.getCurrentForm();

  if (currentForm.invalid) {
    currentForm.markAllAsTouched();
    this.isSubmitted = true;
    return;
  }

  this.carouselIndex++;
}
getCurrentForm(): FormGroup {
  switch (this.carouselIndex) {
    case 0: return this.formStep1;
    case 1: return this.formStep2;
    case 2: return this.formStep3;
    default: return this.formStep1; // Fallback
  }
}

onBack() {
  if (this.carouselIndex > 0) this.carouselIndex--;
}
isSubmitted = false;

submitAll() {
  this.isSubmitted = true;

  if (
    this.formStep1.valid &&
    this.formStep2.valid &&
    this.formStep3.valid
  ) {
    const { day, month, year, gender, username } = this.formStep3.value;

    const birthdate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const formData = {
      username,
      password: this.formStep2.value.password,
      email: this.formStep1.value.email,
      gender,
      birthdate // <-- teraz jeden string zamiast day/month/year
    };

    this.service.createUser(formData).subscribe({
      next: (res) => {
        console.log('Registration successful:', res);
      },
      error: (err) => {
        console.error('Registration failed:', err);
      }
    });
  } else {
    console.warn('One or more forms are invalid.');
  }
}



months = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' }
];

currentYear = new Date().getFullYear();
public hasDisplayableError(form: FormGroup, controlName: string): boolean {
  const control = form.get(controlName);
  return !!control && control.invalid && (control.touched || this.isSubmitted);
}
hide = true;
hasLetter = false;
hasNumberOrSpecial = false;
hasMinLength = false;

checkPassword(): void {
  const value = this.formStep2.get('password')?.value || '';
  this.hasLetter = /[a-zA-Z]/.test(value);
  this.hasNumberOrSpecial = /[\d!@#$%^&*(),.?":{}|<>]/.test(value);
  this.hasMinLength = value.length >= 8;
}

}
