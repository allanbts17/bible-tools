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
import { register } from 'swiper/element/bundle';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { FirestoreService } from './services/firestore.service';
import { VersionMessage } from './interfaces/version-message';
import { log } from './classes/utils';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { DatabaseService } from './services/database.service';
import { RequestService } from './services/request.service';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Bible', url: '/bible-study', icon: 'book' },
    { title: 'Daily devotional', url: '/daily-devotional', icon: 'document-text' },
    { title: 'Verse index', url: '/verse-index', icon: 'list' },
  ];
  header_title = "Herramientas Bíblicas"
  header_subtitle = ""
  darkMode = false
  settings: Settings
  private initPlugin: boolean;
  products: Product[] = [];
  public isWeb: boolean = false;
  showAnimate = false
  lightAnimation = false
  versionMessage: VersionMessage
  constructor(public config: ConfigService,
    public storage: StorageService,
    public theme: ThemeService,
    public platform: Platform,
    private firestore: FirestoreService,
    sql: SQLiteService,
    private dbService: DatabaseService,
    //req: RequestService

    ) {
      
    this.init()
    if(environment.featureFlags.downloadBibles){
      this.appPages.push({ title: 'Download', url: '/download', icon: 'download' })
    }

    // setTimeout(async () => {
    //   await databa.exportToJson()
    // },6000)
  }

  async exportDatabase(){
    await this.dbService.exportToJson()
  }



  getCurrentAppVersion = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    console.log('appUpdateResult',result)
    return result.currentVersion;
  };

  async init() {
    // let div = document.createElement('div')
    // div.classList.add('cover')
    // //let con =
    // document.appendChild(div)

    this.platform.ready().then(async () => {
      //SplashScreen.hide();
      await this.getSettings()
      this.setText()
      
      try {
        this.config.versionApp = parseFloat(await this.getCurrentAppVersion())
      console.log('version',this.config.versionApp);
      } catch (err){
        this.config.versionApp = 1
      }
      this.versionMessage = await this.firestore.getVersionMessage()
    });
    // this.config.remoteConfig = await this.firestore.getRemoteConfig()
    // console.log('set: ',this.config.remoteConfig)
  }

  async getSettings() {
    this.settings = await this.storage.getSettings()
    
    
    this.config.settings = this.settings
    console.log(this.config.settings)
    this.darkMode = this.settings.darkMode
    this.config.lang = this.settings.lang
    this.darkMode ? this.theme.applyDark() : this.theme.removeDark()
    this.lightAnimation = this.darkMode
    this.config.changeFontSize(this.config.settings.options.fontSize)
    
  }

  async openGooglePlay(url: string){
    console.log('opening google play');
    await Browser.open({ url: url });
  }

  changeTheme() {
   // this.lightAnimation = this.darkMode
    this.showAnimate = true
    setTimeout(() => {
      this.showAnimate = false
      this.lightAnimation = this.darkMode
    }, 700)

    setTimeout(() => {
      this.darkMode = !this.darkMode
      this.darkMode ? this.theme.applyDark() : this.theme.removeDark()
      this.settings.darkMode = this.darkMode
      this.config.settings = this.settings
      this.storage.setSettings(this.settings)
    }, 196)

  }

  setText() {
    this.header_title = this.config.getData().menu.header
    console.log('title', this.header_title);

    this.header_subtitle = this.config.getData().menu.note
    for (let i = 0; i < this.appPages.length; i++) {
      this.appPages[i].title = this.config.getData().menu.items[i]
    }
  }

  onRangeChange(e: any){
    let size = e.detail.value
    this.config.settings.options.fontSize = e.detail.value
    this.config.changeFontSize(this.config.settings.options.fontSize)
    this.storage.setSettings(this.config.settings)
    log(e.detail.value)
  }
}

// #1D71B8
// #00ACE9
