import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
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
import { Colors, log } from './classes/utils';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { DatabaseService } from './services/database.service';
import { RequestService } from './services/request.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';

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
  allowExportToJson: boolean = false
  constructor(public config: ConfigService,
    public storage: StorageService,
    public theme: ThemeService,
    public platform: Platform,
    private firestore: FirestoreService,
    sql: SQLiteService,
    private dbService: DatabaseService,
    //req: RequestService

  ) {
    this.allowExportToJson = environment.featureFlags.exportDatabase
    this.init()
    if (environment.featureFlags.downloadBibles) {
      this.appPages.push({ title: 'Download', url: '/download', icon: 'download' })
    }

    
  }

  async getDB(){
    this.dbService.getDB()
  }

  async exportDatabase() {
    let data = await this.dbService.exportToJson()
    console.log("JSON Data", data)
    const jsonString = JSON.stringify(data, null, 2);
    function downloadJson(jsonString: string, fileName: string) {
      // Create a blob of the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a link element
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      // Set the download attribute with the desired file name
      a.href = url;
      a.download = `${fileName}.json`;

      // Append the link to the body (necessary for Firefox)
      document.body.appendChild(a);

      // Trigger click on the link to start download
      a.click();

      // Clean up and remove the link
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    await this.firestore.uploadJson(jsonString)
    console.log("hola quiero descargar a json")
    downloadJson(jsonString, 'database')
  }

  async importDatabase() {
    try {
      let result = await FilePicker.pickFiles({
        types: ['application/json'],
        limit: 1,
        readData: true
      })
      console.log(result)

      const decodedString = this.convertBase64ToString(result.files[0].data);
      let data = JSON.parse(decodedString)
      //console.log(decodedString); // Imprime "Hello world"
      let newDatabase = data.export
      newDatabase['overwrite'] = true
      newDatabase.version = 1
      newDatabase['database'] = "bible-tools"
      console.log(data)
      let response = await this.dbService.importFromJson(JSON.stringify(newDatabase))
      console.log(response)
      
    } catch (e) {
      console.log(e)
    }


  }

  convertBase64ToString(base64String: string): string {
    try {
      // Decodificar Base64 a bytes
      const byteCharacters = atob(base64String);
      
      // Convertir los bytes a un array de Uint8Array
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Utilizar TextDecoder para convertir el array de bytes a string UTF-8
      const decodedString = new TextDecoder('utf-8').decode(byteArray);

      console.log('Decoded String:', decodedString);
      return decodedString;

    } catch (error) {
      console.error('Error decoding Base64:', error);
      return '';
    }
  }



  getCurrentAppVersion = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    console.log('appUpdateResult', result)
    return result.currentVersionCode;
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
        console.log('version', this.config.versionApp);
      } catch (err) {
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
    
    this.lightAnimation = this.darkMode
    this.config.changeFontSize(this.config.settings.options.fontSize)
  }

  async openGooglePlay(url: string) {
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

  onRangeChange(e: any) {
    let size = e.detail.value
    this.config.settings.options.fontSize = e.detail.value
    this.config.changeFontSize(this.config.settings.options.fontSize)
    this.storage.setSettings(this.config.settings)
    log(e.detail.value)
  }
}

// #1D71B8
// #00ACE9
