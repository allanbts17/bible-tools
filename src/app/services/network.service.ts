import { Injectable } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private once = false
  private listenerOnce = false
  status: ConnectionStatus
  status$ = new Subject<ConnectionStatus>()
  constructor() {
    this.getStatus().then(status => {
      this.status = status
    })
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.status = status
      this.status$.next(status)
    });
  }

  logCurrentNetworkStatus = async () => {
    const status = await Network.getStatus();
    console.log('Network status:', status);
  };

  async getStatus(): Promise<ConnectionStatus> {
    return await Network.getStatus()
  }
}
