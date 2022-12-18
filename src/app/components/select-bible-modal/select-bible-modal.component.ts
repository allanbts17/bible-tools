import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-select-bible-modal',
  templateUrl: './select-bible-modal.component.html',
  styleUrls: ['./select-bible-modal.component.scss'],
})
export class SelectBibleModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Input() triggerId
  @Input() changeShared = true
  @Input() isOpen: boolean
  @Output() isOpenChange = new EventEmitter<boolean>()
  @Output() bibleSelectedEvent = new EventEmitter<any>()
  @Output() bibleListEvent = new EventEmitter<any>()

  constructor(public config: ConfigService,
    public sharedInfo: SharedInfoService,
    public apiService: ApiService,
    private storage: StorageService) { }

  async ngOnInit() {
    if (this.sharedInfo.bibles.length === 0) {
      this.getAvailablaBibles()
    }


  }

  async getLastChapterStored() {
    return await this.storage.getLastChapter()
  }

  async getAvailablaBibles() {
    let allBibles = []
    for (let i = 0; i < this.config.availableBibleLanguages.length; i++) {
      let aux
      var lang = this.config.availableBibleLanguages[i]
      await this.apiService.getBiblesByLanguageId(lang.id).then((bibles) => {
        aux = {
          lang: lang,
          bibles: bibles
        }
        this.sharedInfo.bibles.push(aux)
        allBibles.push(...<any>bibles)
      })
    }
    console.log(this.sharedInfo.bibles);

    let lastChapter = await this.getLastChapterStored()
    console.log('last chap',lastChapter);
    if (lastChapter !== undefined) {
      this.sharedInfo.defaultBible = allBibles.find(bible => bible.id === lastChapter.bibleId)
      this.bibleListEvent.emit(lastChapter)
    } else {
      this.sharedInfo.defaultBible = this.sharedInfo.bibles[0].bibles[0]
      this.getBibleFirstChapter(this.sharedInfo.bibles[0].bibles[0])
    }
  }

  getBibleFirstChapter(bible) {
    var auxCh
    this.apiService.getBibleFirstChapter(bible.id).then((chapter) => {
      auxCh = chapter
      this.sharedInfo.defaultChapter = auxCh
      // this.bibleListEvent.emit({
      //   bibleList: this.sharedInfo.bibles.slice(),
      //   defaultBible: { ...this.sharedInfo.defaultBible },
      //   defaultChapter: { ...this.sharedInfo.defaultChapter }
      // })
      this.bibleListEvent.emit({
        bibleId: this.sharedInfo.defaultBible.id,
        chapterId: this.sharedInfo.defaultChapter.id
      })
    }, err => console.log(err))
  }

  /*ngOnChanges(e){
    //console.log(e)
  }*/

  select(bible) {
    if (this.changeShared) this.sharedInfo.defaultBible = bible
    this.bibleSelectedEvent.emit(bible)
    this.modal.dismiss()
  }

  dismiss() {
    this.isOpen = false
    this.isOpenChange.emit(this.isOpen)
  }

}
