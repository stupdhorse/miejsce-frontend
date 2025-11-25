import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../shared/services/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    MatFormFieldModule,   
    MatInputModule,       
    MatSelectModule,     
    MatButtonModule,    
    MatIconModule,
    MatRadioModule,    
    MatDatepickerModule,
    MatNativeDateModule,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
@Output() switchToRegister = new EventEmitter<void>();

form:FormGroup;
hide = true;
submitted = false;
constructor(private fb:FormBuilder, private service: AuthService)
{
  this.form = this.fb.group({
    email: ['',[Validators.required,Validators.required]],
    password: ['',Validators.required]
  })
}

hasDisplayableError(controlName:string){
  const control = this.form.get(controlName);
  return !!control && control.invalid && (this.submitted||control.touched);
}

onLogin()
{
  this.submitted = true;

  if(this.form.invalid)
  {
    this.form.markAllAsTouched();
    return;
  }

  const formData = {
    Username: this.form.value.email,
    Password: this.form.value.password
  }
  this.service.SignInUser(formData).subscribe({
      next: (res) => console.log("Login successful", res),
      error: (err) => console.error("Login failed", err)
  })
}
}
