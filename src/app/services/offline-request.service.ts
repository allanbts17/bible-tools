import { Injectable } from '@angular/core';
import { Passage } from '../interfaces/passage';
import { Chapter } from '../interfaces/chapter';
import { OfflineMethods } from '../offline-methods';
import { BibleDataRepository } from '../repositories/bible-data.repository';
import { SQLiteService } from './sqlite.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfflineRequestService {
  storedBibles: string[]

  constructor(private bibleRep: BibleDataRepository,
    private sqlite: SQLiteService
  ) { }

  retainConnection = false

  async closeConnection(){
    await this.sqlite.closeConnection(environment.databaseName);
  }

  validateOffline(bibleId: string){
    return false
    return this.storedBibles.find(sb => sb == bibleId)
  }

  handleRequest(method: OfflineMethods, bibleId?: string, second?: string): Promise<any> {
      switch(method){
        case OfflineMethods.GET_CHAPTER: {
          return this.bibleRep.getChapterById(bibleId,second,this.retainConnection)
        }
        case OfflineMethods.GET_ALL_BIBLES: {
          return this.bibleRep.getBibles()
        }
        case OfflineMethods.GET_ALL_BOOKS: {
          return this.bibleRep.getBooksByBibleId(bibleId)
        }
        case OfflineMethods.GET_ALL_CHAPTERS: {
          return this.bibleRep.getChaptersByBibleIdAndBook(bibleId,second)
        }
        case OfflineMethods.GET_PASSAGES: {
          return this.bibleRep.getChapterById(bibleId,second)
        }
      }
  }
}
