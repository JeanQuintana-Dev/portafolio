import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      this.theme = document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
    }
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';

    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    document.documentElement.dataset['theme'] = this.theme;
    window.localStorage.setItem('jcqm-theme', this.theme);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', this.theme === 'dark' ? '#18080c' : '#2d0b12');
  }

}
