import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Drivers } from '@ionic/storage';
// import { StatusBar } from '@capacitor/status-bar';
// import { SplashScreen } from '@capacitor/splash-screen';
import { SQLiteService } from './services/sqlite.service';
import { InitializeAppService } from './services/initialize.app.service';
import { DetailService } from './services/detail.service';
import { DatabaseService } from './services/database.service';
import { MigrationService } from './services/migrations.service';
//import { NgxSpinnerModule } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

export function initializeFactory(init: InitializeAppService) {
  return () => init.initializeApp();
}

@NgModule({
  declarations: [AppComponent],
  //entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    FormsModule,
    IonicStorageModule.forRoot({
      name: "new-database",
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB]
    }),
    AppRoutingModule,
    HttpClientModule],
  providers: [
    SQLiteService,
    DetailService,
    DatabaseService,
    InitializeAppService,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    //  ProductRepository,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [InitializeAppService],
      multi: true
    },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },

    MigrationService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
