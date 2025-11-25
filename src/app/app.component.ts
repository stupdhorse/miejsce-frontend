import { Component } from '@angular/core';
import { TranslateService} from '@ngx-translate/core';
import { NavbarComponent } from "./navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  title = 'AppFront';

  constructor(translate: TranslateService) {
    translate.use('en');
  }
}
