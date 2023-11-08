import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { copy } from '../classes/utils';

@Injectable({
  providedIn: 'root'
})
export class SharedInfoService {
  bible
  chapter
  viBible
  viChapter
  bibleList = []
  private allBibles = []
  once = false
  constructor(private config: ConfigService,
    private apiService: ApiService,
    private storage: StorageService) { }

  async init() {
    if(!this.once){
      this.once = true
      await this.getAvailableBibles();
      await this.setChapterAndBible();
      console.log('on sharedInfo');
    }


    //  console.log('sBible',this.bible);
    //  console.log('sChapter',this.chapter);
    // console.log('first schapter',(await this.getBibleFirstChapter(this.bible)));
    // console.log('first sBible',this.bibleList[0].bibles[0]);
    // console.log('sBibleList',this.bibleList);
  }

  async getAvailableBibles() {
    for (let i = 0; i < this.config.availableBibleLanguages.length; i++) {
      let aux;
      var lang = this.config.availableBibleLanguages[i];
      let bibles = await this.apiService.getBiblesByLanguageId(lang.id);
      aux = {
        lang: lang,
        bibles: bibles
      }
      this.bibleList.push(aux);
      this.allBibles.push(...<any>bibles);
    }
  }

  async setChapterAndBible() {
    let lastChapter = await this.getLastChapterStored()
    console.log('last chap', lastChapter);
    if (lastChapter !== null) {
      this.bible = this.allBibles.find(bible => bible.id === lastChapter.bibleId)
      let aux: any = await this.apiService.getChapter(lastChapter.bibleId,lastChapter.chapterId).toPromise()
      console.log('auuux',aux);
      
      this.chapter = aux.data
    } else {
      this.bible = this.bibleList[0].bibles[0]
      this.chapter = await this.getBibleFirstChapter(this.bible)
    }

    this.viBible = copy(this.bible)
    this.viChapter = copy(this.chapter)
  }

  async getLastChapterStored() {
    return await this.storage.getLastChapter()
  }

  async getBibleFirstChapter(bible) {
    let firstChapterData: any = await this.apiService.getBibleFirstChapter(bible.id)
    let chapter: any = await this.apiService.getChapter(firstChapterData.bibleId,firstChapterData.id).toPromise()
    return chapter.data
  }


}
