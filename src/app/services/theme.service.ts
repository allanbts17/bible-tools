import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Colors } from '../classes/utils';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  applyDark() {
    document.querySelector('body').classList.add('dark');
    StatusBar.setBackgroundColor({color: Colors.statusBarDarkMode})
    StatusBar.setStyle({style: Style.Dark})
  }

  removeDark() {
    document.querySelector('body').classList.remove('dark');
    StatusBar.setBackgroundColor({color: Colors.statusBarLightMode})
    StatusBar.setStyle({style: Style.Light})
  }
}
