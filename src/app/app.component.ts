import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

  constructor(private translate: TranslateService) {
    translate.addLangs(['pl', 'en']);
    
    translate.setDefaultLang('pl');

    const savedLang = localStorage.getItem('preferredLang');
    
    const browserLang = translate.getBrowserLang();
    const langToUse = savedLang || (browserLang?.match(/en|pl/) ? browserLang : 'pl');
    
    // 5. Uruchom język
    translate.use(langToUse);
  }
}