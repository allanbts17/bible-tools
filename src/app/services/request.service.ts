import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { log, lopy } from '../classes/utils';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { DummyComponent } from '../components/dummy/dummy.component';
import { ConfigService } from './config.service';
import { FirestoreService } from './firestore.service';
import { NetworkService } from './network.service';

declare var fums;

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  cache = {}
  loadingPresented = false

  constructor(private http: HttpClient,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private config: ConfigService,
    private firestore: FirestoreService,
    private network: NetworkService
  ) { }


  ngOnInit() { }

  async errorMessageAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      //subHeader: 'Important message',
      message: 'Lo sentimos hubo un inconveniente, intente de nuevo',
      buttons: ['OK'],
    });

    alert.present();
  }

  public async showLoading() {
    if (!this.loadingPresented) {
      this.loadingPresented = true
      const modal = await this.modalCtrl.create({
        component: SpinnerComponent,
        cssClass: 'loading-modal',
        showBackdrop: true,
        animated: true
      });
      await modal.present();
    }
  }

  public async hideLoading() {
    await this.modalCtrl.dismiss()
    this.loadingPresented = false
  }

  /**
   * Centralized request
   * @param path required
   * @param headers  required
   * @param saveCache default true
   * @param showLoading default true
   * @param handleError default true
   * @returns {Observable<any>}
   */
  request<T>(path: string, headers?,
    saveCache = true,
    showLoading = true,
    handleError = true): Observable<any> {
    console.log("Request",path,showLoading)
    let index = path + JSON.stringify(headers)
    if (this.cache[index]) {
      return of(this.cache[index])
    }

    try {
      const selectEmiter = () => {
        log('to firebase', this.config.remoteConfig.requestToFirebase)
        if (this.config.remoteConfig.requestToFirebase)
          return this.firestore.apiFirestoreRequest(path)
        else
          return this.http.get<T>(path, headers)
      }
  
      let request$ = selectEmiter().pipe(map(data => {
        if (saveCache) {
          this.cache[index] = data
        }
        return data
      }))

      let promise = new Promise(async (sucess, reject) => {
        if (showLoading) await this.showLoading()
        request$.subscribe(async (data: any) => {
          if (data?.meta?.fumsToken)
            fums(
              "trackView",
              data.meta.fumsToken
            ).then(data => {
              console.log('sended', data);
            });
  
          if (showLoading) this.hideLoading()
          sucess(data)
        }, async error => {
          if (showLoading) await this.hideLoading()
          if (handleError) await this.errorMessageAlert()
          reject(error)
        })
      })
     
      return from(promise)

    } catch (error) {
      console.log('request error',error);
    }
  }
}
