import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc, getFirestore, getDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ConfigService } from './config.service';
import { interval, firstValueFrom } from 'rxjs';
import { VersionMessage } from '../interfaces/version-message';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private afs: AngularFirestore,
    private config: ConfigService) { }

  async getVersionMessage(): Promise<VersionMessage>{

    let versionsData$ = this.afs.collection("VersionMessages",
    ref => ref.where('version', '>', this.config.versionApp)).get()
    let data = (await firstValueFrom(versionsData$)).docs.map(doc => doc.data())
      .sort((a: VersionMessage,b: VersionMessage)=>{
        return b.version - a.version
      })[0];
    //console.log(data);
    return data as VersionMessage
  }
}
