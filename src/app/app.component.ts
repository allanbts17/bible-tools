import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { Product } from './interfaces/Product';
import { Settings } from './interfaces/settings';
import { ConfigService } from './services/config.service';
import { SQLiteService } from './services/sqlite.service';
import { StorageService } from './services/storage.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Bible', url: '/bible-study', icon: 'book' },
    { title: 'Daily devotional', url: '/daily-devotional', icon: 'document-text' },
    { title: 'Verse index', url: '/verse-index', icon: 'list' }
  ];
  header_title = ""
  header_subtitle = ""
  darkMode = false
  settings: Settings
  private initPlugin: boolean;
  products: Product[] = [];
  public isWeb: boolean = false;
  constructor(public config: ConfigService,
    public storage: StorageService,
    public theme: ThemeService
   /* private _detail: DetailService,*/) {
    this.init()
  }

  async init(){
    await this.getSettings()
    this.setText()
  }

  async getSettings(){
    this.settings = await this.storage.getSettings()
    //console.log('set: ',this.settings)
    this.config.settings = this.settings
    console.log(this.config.settings)
    this.darkMode = this.settings.darkMode
    this.config.lang = this.settings.lang
    this.darkMode? this.theme.applyDark():this.theme.removeDark()

  }

  changeTheme(){
    this.darkMode = !this.darkMode
    this.darkMode? this.theme.applyDark():this.theme.removeDark()
    this.settings.darkMode = this.darkMode
    this.config.settings = this.settings
    this.storage.setSettings(this.settings)
  }

  setText(){
    this.header_title = this.config.getData().menu.header
    this.header_subtitle = this.config.getData().menu.note
    for(let i=0;i<this.appPages.length;i++){
      this.appPages[i].title = this.config.getData().menu.items[i]
    }
  }
}
