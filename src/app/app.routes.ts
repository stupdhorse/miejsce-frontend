import { Routes } from '@angular/router';
import { UserComponent } from './pages/user/user.component';
import { LoginComponent } from './pages/user/login/login.component';
import { RegistrationComponent } from './pages/user/registration/registration.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AddEventComponent } from './pages/events/add-event/add-event.component';

export const routes: Routes = [
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegistrationComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path:'discover',component: DiscoverComponent },
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  {path: 'profile', component: ProfileComponent},
  { path: 'profile/:id', component: ProfileComponent },
  {path:'add',component: AddEventComponent}
];
