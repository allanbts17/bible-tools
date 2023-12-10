import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { log } from 'src/app/classes/utils';
import { Bible } from 'src/app/interfaces/bible';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';

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
    private firestore: FirestoreService){
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
    if(bible.status !== 0) return
    bible.status = 1
    let step = 1/67
    //log(bible)
    let books
    this.firestore.getBooks(bible.id).then(async data => {
      books = data
      bible.progress += step
      for(let bk of books){
        books['chapters'] = await this.firestore.getChapters(bible.id,bk.id)
        bible.progress += step
      }
      bible.status = 2
      console.log('finished',books);
      
    })
  }

}
