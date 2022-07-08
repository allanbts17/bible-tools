import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  applyDark() {
    document.querySelector('body').classList.add('dark');
  }

  removeDark() {
    document.querySelector('body').classList.remove('dark');
  }
}
