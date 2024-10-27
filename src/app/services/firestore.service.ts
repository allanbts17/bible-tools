import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc, getFirestore, getDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ConfigService } from './config.service';
import { interval, firstValueFrom, Observable, throwError, from } from 'rxjs';
import { VersionMessage } from '../interfaces/version-message';
import { RemoteConfig } from '../interfaces/remote-config';
import { log, OrderedBooksID } from '../classes/utils';
import { map } from 'rxjs/operators';
import { Chapter } from '../interfaces/chapter';
import { Passage } from '../interfaces/passage';
import { OfflineRequestService } from './offline-request.service';
import { OfflineMethods } from '../offline-methods';
import { StoredBook } from '../interfaces/stored-book';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private afs: AngularFirestore,
    private config: ConfigService,
    private offline: OfflineRequestService,
    private network: NetworkService) {
    // this.apiFirestoreRequest('')
  }

  async uploadJson(json: string) {
    (await this.afs.collection("DatabaseJson").add({ data: json, date: Date()}))
  }

  async getVersionMessage(): Promise<VersionMessage> {

    let versionsData$ = this.afs.collection("VersionMessages",
      ref => ref.where('version', '>', this.config.versionApp)).get()
    let data = (await firstValueFrom(versionsData$)).docs.map(doc => doc.data())
      .sort((a: VersionMessage, b: VersionMessage) => {
        return b.version - a.version
      })[0];
    //console.log(data);
    return data as VersionMessage
  }

  async getRemoteConfig(): Promise<RemoteConfig> {
    //console.log('to requestttt')
    let data$ = this.afs.collection('Config').doc('config').get()
    let data = ((await firstValueFrom(data$)).data()) as RemoteConfig
    //console.log('test',data)
    return data
  }

  async getBooks(bibleId: string) {
    let response$ = this.afs.collection(`Bibles/${bibleId}/Books`).get()
    let data = (await firstValueFrom(response$)).docs.map(doc => doc.data())
    return data
  }

  async getChapters(bibleId: string, bookId: string) {
    let response$ = this.afs.collection(`Bibles/${bibleId}/Books/${bookId}/Chapters`).get()
    let data = (await firstValueFrom(response$)).docs.map(doc => doc.data())
    return data
  }

 
  apiFirestoreRequest(url: string) {
    let response$: Observable<any>
    try {
      console.log('test true', url)
      //debugger
      // get chapter
      //url = 'https://api.scripture.api.bible/v1/bibles/592420522e16049f-01/chapters/JDG.11?include-verse-spans=true&include-notes=false&fums-version=3'
      const getMatches = (regex: RegExp): { fir: string, sec: string } => {
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

      if (getChapter.test(url)) {
        console.log('enter on getChapter',url);
        let { fir, sec } = getMatches(getChapter)
        if(this.offline.validateOffline(fir))
          response$ = from(this.offline.handleRequest(OfflineMethods.GET_CHAPTER,fir,sec)).pipe(map(res => {
            return {
              data: res,
              meta: res.meta
            }
        }))
        else {
          response$ = this.afs.collection(`Bibles/${fir}/Books/${sec.split('.')[0]}/Chapters`).doc(sec).get().pipe(map(res => res.data())) 
        }


      } else if (getAllBibles.test(url)) {
        console.log('enter on allbibles');
        // let no_conection = true
        console.log("network",this.network.status)
        if(!this.network.status.connected)
          response$ = from(this.offline.handleRequest(OfflineMethods.GET_ALL_BIBLES)).pipe(map(res => {
            return {
              data: res
            }
          }))
        else
          response$ = this.afs.collection(`Bibles`).get()
          .pipe(map(res => {
            return {
              data: res.docs.map(doc => doc.data())
            }
          }))


      } else if (getAllBooks.test(url)) {
        console.log('enter on allBooks');
        let { fir, sec } = getMatches(getAllBooks)
        if(this.offline.validateOffline(fir))
          response$ = from(this.offline.handleRequest(OfflineMethods.GET_ALL_BOOKS,fir)).pipe(map((res: StoredBook[]) => {
            return { data: res
          }
          }))
        else
          response$ = this.afs.collection(`Bibles`).doc(fir).get().pipe(map((res: any) => {
            return { data: res.data()?.bookList }
          }))


      } else if (getAllChapters.test(url)) {
        console.log('enter on allChapters');
        let { fir, sec } = getMatches(getAllChapters)
        if(this.offline.validateOffline(fir))
          response$ = from(this.offline.handleRequest(OfflineMethods.GET_ALL_CHAPTERS,fir,sec.split('.')[0])).pipe(map((res: any) => {
            return { data: res }
          }))
        else
          response$ = this.afs.collection(`Bibles/${fir}/Books`).doc(sec.split('.')[0]).get().pipe(map((res: any) => {
            return { data: res.data()?.chapterList }
          }))



      } else if (getPassages.test(url)) {
        console.log('enter on passages');

        let { fir, sec } = getMatches(getPassages)
        let passageRange = sec.match(new RegExp(/(.+)\.(.+)\.(.+)-(?:.+)\.(?:.+)\.(.+)/))
        if (!passageRange)
          passageRange = sec.match(new RegExp(/(.+)\.(.+)\.(.+)/))
        let bibleId = fir
        let book = passageRange[1]
        let chapter = passageRange[2]
        let firstVerse = passageRange[3]
        let lastVerse = passageRange[4]

        let auxObs$: Observable<any>

        if(this.offline.validateOffline(fir))
          auxObs$ = from(this.offline.handleRequest(OfflineMethods.GET_PASSAGES,fir,`${book}.${chapter}`))
        else
          auxObs$ = this.afs.collection(`Bibles/${fir}/Books/${book}/Chapters`).doc(`${book}.${chapter}`).get()

        auxObs$.subscribe(data => {
          console.log("auxObs")
          console.log(data)
        })
        response$ = auxObs$.pipe(map(res => {
          let chapterData: Chapter
          if(this.offline.validateOffline(fir)){
            chapterData = {
              data: res,
              meta: res.meta
            }
          } else {
            chapterData = res.data()
          }
          let content = chapterData.data.content
          let htmlObject = document.createElement('div');
          htmlObject.innerHTML = content;

          let htmlList = []
          if (!lastVerse) {
            lastVerse = firstVerse
          }
          for (let i = Number(firstVerse); i <= Number(lastVerse); i++) {
            let nodeCollection = htmlObject.querySelectorAll(
              `[data-verse-id="${book}.${chapter}.${i}"]`
            )
            nodeCollection.forEach(obj => {
              //console.log(obj.innerHTML)
              let openSpan = `<span class="verse-span" data-verse-id="${book}.${chapter}.${i}" data-verse-org-ids=${book}.${chapter}.${i}">`
              htmlList.push(openSpan + obj.innerHTML + '</span>')
            })
          }

          //console.log('dataaaa', htmlList)

          let oneVerse = lastVerse == firstVerse

          const passageResponse: Passage = {
            data: {
              id: oneVerse ? `${book}.${chapter}.${firstVerse}` : `${book}.${chapter}.${firstVerse}-${book}.${chapter}.${lastVerse}`,
              orgId: oneVerse ? `${book}.${chapter}.${firstVerse}` : `${book}.${chapter}.${firstVerse}-${book}.${chapter}.${lastVerse}`,
              bookId: book,
              chapterIds: [`${book}.${chapter}`],
              reference: oneVerse ? `${chapterData.data.reference}:${firstVerse}` : `${chapterData.data.reference}:${firstVerse}-${lastVerse}`,
              content: `<p class="p">${htmlList.join()}</p>`,
              verseCount: Number(lastVerse) - Number(firstVerse),
              copyright: chapterData.data.copyright
            },
            meta: chapterData.meta
          }
          return passageResponse;
        }))
      } else if (getAllVerses.test(url)) {
        console.log('enter on allverses');
      } else if (getVerse.test(url)) {
        console.log('enter on verse');
      }

      //  log(url.match(getChapter))
      //log(url.match(getChapter)[1],url.match(getChapter)[2]);
      return response$
    } catch (error) {
      return throwError(() => error)
    }

  }
}
