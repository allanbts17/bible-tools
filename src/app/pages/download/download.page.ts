import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { log, lopy } from 'src/app/classes/utils';
import { Bible } from 'src/app/interfaces/bible';
import { BibleDataRepository } from 'src/app/repositories/bible-data.repository';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-download.page',
  templateUrl: './download.page.html',
  styleUrls: ['./download.page.css']
})
export class DownloadPage implements OnInit {
  prograssBarData = []
  biblesData = []

  constructor(protected config: ConfigService,
    public sharedInfo: SharedInfoService,
    private api: ApiService,
    private firestore: FirestoreService,
    private task: TaskService,
    private bibleRep: BibleDataRepository,
    private db: DatabaseService){
      // status
      // 0 No stored
      // 1 Downloading
      // 2 Just stored
      // 3 Already stored
      api.getAllBibles().subscribe(data => {
        this.biblesData = data.data.map(b => {
          return {
            ...b,
            status: 0,
            progress: 0
          }
        })
        //log(this.biblesData)
      })
    }
  

  ngOnInit(): void {

  }



  select(bible: any) {
    if(bible.status == 1) {
      bible.status = 0
      this.task.abortTask(bible.id)
      
      return
    }
    if(bible.status !== 0) return
    bible.status = 1
   
    this.task.createTask(bible.id,(id)=>{
      
      let books: any[]
      this.firestore.getBooks(bible.id).then(async data => {
        books = data
        let step = 1/(4 + books.length)
        bible.progress += step
        this.task.checkStatus(id)

        for(let bk of books){
          this.task.checkStatus(id)
          bk['chapters'] = await this.firestore.getChapters(bible.id,bk.id)
          this.task.checkStatus(id)
          bible.progress += step
        }

        await this.db.createConnection()
        await this.bibleRep.createBible(bible)
        bible.progress += step
        this.task.checkStatus(id)
        // let bookPromises = []
        // let chapterPromises = []
        // books.forEach(bk => {
        //   bookPromises.push(this.bibleRep.createBooks(bk))
        //   bk.chapters.forEach(ch => {
        //     chapterPromises.push(this.bibleRep.createChapters(ch))
        //   })
        // })
        for(let bk of books){
          this.task.checkStatus(id)
          await this.bibleRep.createBooks(bk)
          bible.progress += step
          lopy('book pro',bible.progress)
          for(let ch of bk.chapters){
            this.task.checkStatus(id)
            await this.bibleRep.createChapters(ch)
          }
        }
        this.task.checkStatus(id)
        // this.task.checkStatus(id)
        // await Promise.all(bookPromises)
        // this.task.checkStatus(id)
        // bible.progress += step
        // await Promise.all(chapterPromises)
        // this.task.checkStatus(id)
        
        bible.progress = 1
        bible.status = 2
        console.log('finished',books);
        await this.db.closeConnection()
        
      }).catch(async (error) => { 
        console.log(error)
        await this.db.closeConnection()
      })
    })
  }

}
