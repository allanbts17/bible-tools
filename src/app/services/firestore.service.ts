import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc, getFirestore, getDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ConfigService } from './config.service';
import { interval, firstValueFrom, Observable } from 'rxjs';
import { VersionMessage } from '../interfaces/version-message';
import { RemoteConfig } from '../interfaces/remote-config';
import { log } from '../classes/utils';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private afs: AngularFirestore,
    private config: ConfigService) {
     // this.apiFirestoreRequest('')
     }

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

  async getRemoteConfig(): Promise<RemoteConfig>{
    //console.log('to requestttt')
    let data$ = this.afs.collection('Config').doc('config').get()
    let data =  ((await firstValueFrom(data$)).data()) as RemoteConfig
    //console.log('test',data)
    return data
  }

  apiFirestoreRequest(url: string) {
    //log('test true')
    // get chapter
    //url = 'https://api.scripture.api.bible/v1/bibles/592420522e16049f-01/chapters/JDG.11?include-verse-spans=true&include-notes=false&fums-version=3'
    const getMatches = (regex: RegExp): {fir:string,sec:string} => {
     return {
      fir: url.match(regex)[1],
      sec: url.match(regex)[2]
     } 
    }

    const getChapter = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/chapters\/(.+)\?.+/)
    const getAllBibles = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles$/)
    const getAllBooks = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/books$/)
    const getAllChapters = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/books\/(.+)\/chapters$/)
    const getPassages = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/passages\/(.+)\/\?.+/)
    const getAllVerses = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/chapters\/(.+)\/verses.*/)
    const getVerse = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/verses\/(.+).*/)
    let response$: Observable<any>
    if(getChapter.test(url)){
      let {fir,sec} = getMatches(getChapter)
      response$ = this.afs.collection(`Bibles/${fir}/Books/${sec.split('.')[0]}/Chapters`).doc(sec).get().pipe(map(res => res.data()))
    } else if(getAllBibles.test(url)) {
      response$ = this.afs.collection(`Bibles`).get()
        .pipe(map(res => {
          return {
            data: res.docs.map(doc => doc.data())
          }
        }))
    } else if(getAllBooks.test(url)) {
      let {fir,sec} = getMatches(getAllBooks)
      response$ = this.afs.collection(`Bibles`).doc(fir).get().pipe(map((res:any) => {
        return { data: res.data()?.bookList }
      }))
    } else if(getAllChapters.test(url)) {
      let {fir,sec} = getMatches(getAllChapters)
      response$ = this.afs.collection(`Bibles/${fir}/Books`).doc(sec.split('.')[0]).get().pipe(map((res:any) => {
        return { data: res.data()?.chapterList }
      }))
    } else if(getPassages.test(url)) {
      
    } else if(getAllVerses.test(url)) {
      
    } else if(getVerse.test(url)) {
      
    }

  //  log(url.match(getChapter))
    //log(url.match(getChapter)[1],url.match(getChapter)[2]);
    return response$
  }
}
