import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

const NOTES_KEY = 'notes'
const NOTES_CATEGORY_KEY = 'categories'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {
    this.init();
  }

 /* async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*.../);
    const storage = await this.storage.create();
    this._storage = storage;
  }*/

  async init(){
    console.log('INIT')
    await this.storage.create()
    console.log('DONE')
  }

  getData(key){
    console.log('GET DATA')
    return this.storage.get(key) || []
  }

  async addData(key: string, item: any){
    const storedData = await this.storage.get(key) || []
    storedData.push(item)
    return this.storage.set(key,storedData)
  }

  async removeItem(key: string, index: number){
    const storedData = await this.storage.get(key) || []
    storedData.splice(index,1)
    return this.storage.set(key,storedData)
  }
}
