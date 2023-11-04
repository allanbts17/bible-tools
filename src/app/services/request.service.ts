import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map }  from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { lopy } from '../classes/utils';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { DummyComponent } from '../components/dummy/dummy.component';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  cache = {}
  loadingPresented = false

  constructor(private http: HttpClient,
    private modalCtrl: ModalController,
    private alertController: AlertController) { }


    ngOnInit() {}
  
    async errorMessageAlert() {
      const alert = await this.alertController.create({
        header: 'Error',
        //subHeader: 'Important message',
        message: 'Lo sentimos hubo un inconveniente, intente de nuevo',
        buttons: ['OK'],
      });
  
      await alert.present();
    }

  private async showLoading() {
    if(!this.loadingPresented){
      this.loadingPresented = true
      const modal = await this.modalCtrl.create({
        component: SpinnerComponent,
        cssClass:'loading-modal',
        showBackdrop: true,
        animated: true
      });
      await modal.present();
    }
  }

  private async hideLoading(){
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
  request<T>(path: string,headers?,
    saveCache = true,
    showLoading = true,
    handleError = true): Observable<any>{
    let index = path + JSON.stringify(headers)
    if(showLoading) this.showLoading()
    if(this.cache[index]){
      if(showLoading) this.hideLoading()
      return of(this.cache[index])
    }
    let request$ = this.http.get<T>(path,headers).pipe(map(data => {
      if(saveCache){
        this.cache[index] = data
      }
      return data
    }))

    let promise = new Promise((sucess,reject)=>{
      request$.subscribe(data => {
        if(showLoading) this.hideLoading()
        sucess(data)
      },async error => {
        //console.log('on error',error);
        if(handleError) await this.errorMessageAlert()
        if(showLoading) this.hideLoading()
        reject(error)
      })
    })
    return from(promise)
  }
}
