import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
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
  settings
  private initPlugin: boolean;
  public isWeb: boolean = false;
  constructor(public config: ConfigService,
    public storage: StorageService,
    public theme: ThemeService,
    private platform: Platform,
    private sqlite: SQLiteService,
   /* private _detail: DetailService,*/) {
    this.init()
  }

  async init(){
    await this.getSettings()
    this.setText()
    this.initializeApp()
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.sqlite.initializePlugin().then(async (ret) => {
        this.initPlugin = ret;
        if( this.sqlite.platform === "web") {
          this.isWeb = true;
          await customElements.whenDefined('jeep-sqlite');
          const jeepSqliteEl = document.querySelector('jeep-sqlite');
          if(jeepSqliteEl != null) {
            await this.sqlite.initWebStore();
            console.log(`>>>> isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
          } else {
            console.log('>>>> jeepSqliteEl is null');
          }
        }


        let data = await this.sqlite.createConnection('YOUR_DB1.db',false,'encryption',1)
        console.log(data)
        let op = await this.sqlite.open()
        console.log(op);
        let msg = await this.sqlite.echo('holaa mundo');
        let response = await this.sqlite.execute('CREATE TABLE IF NOT EXISTS Messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT)')
        console.log(response)
        console.log(msg)
        console.log(`>>>> in App  this.initPlugin ${this.initPlugin}`);
      });
    });
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
