import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, HomeComponent, FooterComponent, WhatsappComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
