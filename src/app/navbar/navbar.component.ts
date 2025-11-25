import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  currentUrl: string = '';
  isLoggedIn: boolean=false;

  constructor(private router:Router,private authService:AuthService){
    this.router.events
    .pipe(filter(event=>event instanceof NavigationEnd))
    .subscribe((event:NavigationEnd)=>
    {this.currentUrl = event.urlAfterRedirects;});
  }

  ngOnInit(): void {
    this.chechAuthStatus();
  }

  chechAuthStatus(){
    const token = this.authService.getToken();
    return this.isLoggedIn=!!token;
  }

  showAuthButtons():boolean{
      return !this.currentUrl.startsWith('/user');
  }
  navigateTo(route:string):void{
    this.router.navigate([route]);
  }

}
