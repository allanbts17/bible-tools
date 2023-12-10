import { Injectable } from '@angular/core';
import { collection, doc, getDocs, setDoc, getFirestore, getDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ConfigService } from './config.service';
import { interval, firstValueFrom, Observable, throwError } from 'rxjs';
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
        console.log('enter on getChapter');
        let { fir, sec } = getMatches(getChapter)
        response$ = this.afs.collection(`Bibles/${fir}/Books/${sec.split('.')[0]}/Chapters`).doc(sec).get().pipe(map(res => res.data()))
      } else if (getAllBibles.test(url)) {
        console.log('enter on allbibles');
        response$ = this.afs.collection(`Bibles`).get()
          .pipe(map(res => {
            return {
              data: res.docs.map(doc => doc.data())
            }
          }))
      } else if (getAllBooks.test(url)) {
        console.log('enter on allBooks');
        let { fir, sec } = getMatches(getAllBooks)
        response$ = this.afs.collection(`Bibles`).doc(fir).get().pipe(map((res: any) => {
          return { data: res.data()?.bookList }
        }))
      } else if (getAllChapters.test(url)) {
        console.log('enter on allChapters');
        let { fir, sec } = getMatches(getAllChapters)
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
        response$ = this.afs.collection(`Bibles/${fir}/Books/${book}/Chapters`).doc(`${book}.${chapter}`).get().pipe(map(res => {
          let chapterData: Chapter = res.data() as Chapter
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
