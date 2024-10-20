import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { map } from 'rxjs';
import { BibleDownloadStatus } from 'src/app/classes/bible-download-status';
import { log, lopy } from 'src/app/classes/utils';
import { Bible } from 'src/app/interfaces/bible';
import { BibleDataRepository } from 'src/app/repositories/bible-data.repository';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { StorageService } from 'src/app/services/storage.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-download.page',
  templateUrl: './download.page.html',
  styleUrls: ['./download.page.css']
})
export class DownloadPage implements OnInit {
  prograssBarData = []
  biblesData = []
  status = BibleDownloadStatus
  storedBibles: string[] = []

  constructor(protected config: ConfigService,
    public sharedInfo: SharedInfoService,
    private api: ApiService,
    private firestore: FirestoreService,
    private task: TaskService,
    private bibleRep: BibleDataRepository,
    private db: DatabaseService,
    private storage: StorageService,
    private alertController: AlertController) {
    // status
    // 0 No stored
    // 1 Downloading
    // 2 Just stored
    // 3 Already stored

    storage.getStoredBibles().then((bibles: string[]) => {
      this.storedBibles = bibles
      api.getAllBibles().subscribe(data => {
        this.biblesData = data.data.map(b => {
          return {
            ...b,
            status: bibles.find(bible => bible == b.id) ? BibleDownloadStatus.ALREADY_STORED : BibleDownloadStatus.NO_STORED,
            progress: 0
          }
        })
        //log(this.biblesData)
      })
    })

  }


  async ngOnInit(): Promise<void> {
    let bibles = await this.bibleRep.getBibles()
    let chapters = await this.bibleRep.getChapters()
    let books = await this.bibleRep.getBooks()
    console.log('bibles', bibles)
    console.log('chapters', chapters)
    console.log('books', books)

  }

  async presentAlert(callback: any) {
    const alert = await this.alertController.create({
      header: 'Borrando versiones',
      message: '¿Seguro que desea borrar esta versión de la biblia?',
      buttons: [
        {
          text: "Sí",
          role: 'confirm',
          handler: () => {
            callback()
          }
        },
        {
          text: "No",
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }


  toDelete(bibleStatus: BibleDownloadStatus) {
    if (bibleStatus == BibleDownloadStatus.ALREADY_STORED || bibleStatus == BibleDownloadStatus.JUST_STORED)
      return true
    else
      return false
  }

  deleteBible(bible: any) {
    

    let onDelete = async () => {
      //console.log(bible, bible.id)
      bible.status = BibleDownloadStatus.DELETING

      await this.bibleRep.deleteBibleById(bible.id)
      await this.bibleRep.deleteBooksByBibleId(bible.id)
      await this.bibleRep.deleteChapterByBibleId(bible.id)
      this.storedBibles = this.storedBibles.filter(sb => sb !== bible.id)
      await this.storage.setStoredBibles(this.storedBibles)

      bible.status = BibleDownloadStatus.NO_STORED
    }

    this.presentAlert(onDelete)

  }



  select(bible: any) {
    if (bible.status == BibleDownloadStatus.DOWNLOADING) {
      bible.status = BibleDownloadStatus.NO_STORED
      this.task.abortTask(bible.id)
      return
    }
    if (bible.status !== BibleDownloadStatus.NO_STORED) return
    bible.status = BibleDownloadStatus.DOWNLOADING

    this.task.createTask(bible.id, (id) => {

      let books: any[]
      this.firestore.getBooks(bible.id).then(async data => {
        books = data
        let step = 1 / (4 + books.length)
        bible.progress += step
        this.task.checkStatus(id)

        for (let bk of books) {
          this.task.checkStatus(id)
          bk['chapters'] = await this.firestore.getChapters(bible.id, bk.id)
          this.task.checkStatus(id)
          bible.progress += step
        }

        await this.db.createConnection()
        await this.bibleRep.createBible(bible)
        bible.progress += step
        this.task.checkStatus(id)
        for (let bk of books) {
          this.task.checkStatus(id)
          await this.bibleRep.createBooks(bk)
          bible.progress += step
          lopy('book pro', bible.progress)
          for (let ch of bk.chapters) {
            this.task.checkStatus(id)
            await this.bibleRep.createChapters(ch)
          }
        }

        this.storedBibles.push(bible.id)
        await this.storage.setStoredBibles(this.storedBibles)
        this.task.checkStatus(id)

        bible.progress = 1
        bible.status = BibleDownloadStatus.JUST_STORED
        console.log('finished', books);
        await this.db.closeConnection()

      }).catch(async (error) => {
        console.log(error)
        await this.db.closeConnection()
      })
    })
  }

}
