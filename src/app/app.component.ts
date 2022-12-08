import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { Product } from './interfaces/Product';
import { ProductDefaultQueryRepository } from './repositories/product.default.query.repository';
import { ProductRepository } from './repositories/product.repository';
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
  products: Product[] = [];
  public isWeb: boolean = false;
  constructor(public config: ConfigService,
    public storage: StorageService,
    public theme: ThemeService,
    private platform: Platform,
    private sqlite: SQLiteService,
    private productRepository: ProductRepository, private productDefaultQueryRepository: ProductDefaultQueryRepository
   /* private _detail: DetailService,*/) {
    this.init()
  }

  async init(){
    await this.getSettings()
    this.setText()
    this.initializeApp()
  }

  async getProducts() {
    // await this.productRepository.createTestData();
    this.products = await this.productRepository.getProducts();
    console.log(`databaseService used: products:`);
    console.log(this.products);
    if(this.products.length == 0)
      await this.productRepository.createTestData();

    //this.productRepository.deleteProductById(3)
    //normal db open db close version
    // await this.productDefaultQueryRepository.getProducts();
    // console.log(`default dbopen dbclose used:`);
    // console.log(this.products);
  }

  initializeApp() {
    this.getProducts()
    // this.platform.ready().then(async () => {
    //   this.sqlite.initializePlugin().then(async (ret) => {
    //     this.initPlugin = ret;
    //     if( this.sqlite.platform === "web") {
    //       this.isWeb = true;
    //       await customElements.whenDefined('jeep-sqlite');
    //       const jeepSqlite = document.querySelector('jeep-sqlite');
    //       if(jeepSqlite != null) {
    //         await this.sqlite.initWebStore();
    //         console.log(`>>>> isStoreOpen ${await jeepSqlite.isStoreOpen()}`);

    //         await jeepSqlite.createConnection({
    //           database:"testNew",
    //           version: 1
    //       });
    //       } else {
    //         console.log('>>>> jeepSqliteEl is null');
    //       }
    //     }
    //     let data = await this.sqlite.createConnection('YOUR_DB1.db',false,'encryption',1,false)
    //     console.log(data)
    //     //console.log(msg)
    //     console.log(`>>>> in App  this.initPlugin ${this.initPlugin}`);
    //   });
    // });
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
