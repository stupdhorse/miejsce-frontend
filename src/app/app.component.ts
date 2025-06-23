import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserComponent } from './pages/user/user.component';

@Component({
  selector: 'app-root',
  imports: [UserComponent],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  title = 'AppFront';
}
