import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc, getFirestore, getDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ConfigService } from './config.service';
import { interval, firstValueFrom, Observable } from 'rxjs';
import { VersionMessage } from '../interfaces/version-message';
import { RemoteConfig } from '../interfaces/remote-config';
import { log } from '../classes/utils';
import { map } from 'rxjs/operators';
import { Chapter } from '../interfaces/chapter';
import { Passage } from '../interfaces/passage';

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
    console.log('test true')
    //debugger
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
    const getPassages = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/passages\/(.+)\?.+/)
    const getAllVerses = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/chapters\/(.+)\/verses.*/)
    const getVerse = new RegExp(/https\:\/\/api\.scripture\.api\.bible\/v1\/bibles\/(.+)\/verses\/(.+).*/)
    let response$: Observable<any>
    if(getChapter.test(url)){
      console.log('enter on getChapter');
      let {fir,sec} = getMatches(getChapter)
      response$ = this.afs.collection(`Bibles/${fir}/Books/${sec.split('.')[0]}/Chapters`).doc(sec).get().pipe(map(res => res.data()))
    } else if(getAllBibles.test(url)) {
      console.log('enter on allbibles');
      response$ = this.afs.collection(`Bibles`).get()
        .pipe(map(res => {
          return {
            data: res.docs.map(doc => doc.data())
          }
        }))
    } else if(getAllBooks.test(url)) {
      console.log('enter on allBooks');
      let {fir,sec} = getMatches(getAllBooks)
      response$ = this.afs.collection(`Bibles`).doc(fir).get().pipe(map((res:any) => {
        return { data: res.data()?.bookList }
      }))
    } else if(getAllChapters.test(url)) {
      console.log('enter on allChapters');
      let {fir,sec} = getMatches(getAllChapters)
      response$ = this.afs.collection(`Bibles/${fir}/Books`).doc(sec.split('.')[0]).get().pipe(map((res:any) => {
        return { data: res.data()?.chapterList }
      }))
    } else if(getPassages.test(url)) {
      console.log('enter on passages');
      
      let {fir,sec} = getMatches(getPassages)
      const passageRange = sec.match(new RegExp(/(.+)\.(.+)\.(.+)-(?:.+)\.(?:.+)\.(.+)/))
      let bibleId = fir
      let book = passageRange[1]
      let chapter = passageRange[2]
      let firstVerse = passageRange[3]
      let lastVerse = passageRange[4]
      response$ = this.afs.collection(`Bibles/${fir}/Books/${book}/Chapters`).doc(`${book}.${chapter}`).get().pipe(map(res => {
        let chapterData: Chapter = res.data() as Chapter
        let content = chapterData.data.content
        let versesRegex = /<span class="verse-span" data-verse-id=".{3}\..{1,3}\..{1,3}" data-verse-org-ids=".{3}\..{1,3}\..{1,3}">(?:(?!.*<span).*|<span data-number="[\d]+" data-sid="[A-Z]{3} [\d]+:[\d]+" class="v">[\d]+<\/span>)<\/span>/g
        //let versesRegex = new RegExp(`<span class="verse-span" data-verse-id=".{3}\\..{1,3}\\..{1,3}" data-verse-org-ids=".{3}\\..{1,3}\\..{1,3}">(?:(?!.*<span).*|<span data-number="[\\d]+" data-sid="[A-Z]{3} [\\d]+:[\\d]+" class="v">[\\d]+<\\/span>)<\\/span>`,'g')
        let versesList = content.match(versesRegex).filter(verse => {
          let re = /<span class="verse-span" data-verse-id=".{3}\..{1,3}\.(.{1,3})".*/
          let verseNum = Number(verse.match(re)[1])
          if(lastVerse)
            return verseNum >= Number(firstVerse) && verseNum <= Number(lastVerse)
          else
          return verseNum == Number(firstVerse)
        })
        console.log('verses list',versesList);
        
        const passageResponse: Passage = {
          data: {
            id: `${book}.${chapter}.${firstVerse}-${book}.${chapter}.${lastVerse}`,
            orgId: `${book}.${chapter}.${firstVerse}-${book}.${chapter}.${lastVerse}`,
            bookId: book,
            chapterIds: [ `${book}.${chapter}` ],
            reference: `${chapterData.data.reference}:${firstVerse}-${lastVerse}`,
            content: `<p class="p">${versesList.join()}</p>`,
            verseCount: Number(lastVerse) - Number(firstVerse),
            copyright: chapterData.data.copyright
          },
          meta: chapterData.meta
        }
        return passageResponse;
      }))
    } else if(getAllVerses.test(url)) {
      console.log('enter on allverses');
    } else if(getVerse.test(url)) {
      console.log('enter on verse');
    }

  //  log(url.match(getChapter))
    //log(url.match(getChapter)[1],url.match(getChapter)[2]);
    return response$
  }
}
