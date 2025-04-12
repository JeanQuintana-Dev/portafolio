import { Component } from '@angular/core';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { HomeComponent } from './home/home.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'portafolio';
  
  
}


