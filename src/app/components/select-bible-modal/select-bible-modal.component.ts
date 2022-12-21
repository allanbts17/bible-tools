import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { ConfigService } from 'src/app/services/config.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { StorageService } from 'src/app/services/storage.service';
import { copy } from 'src/app/classes/utils';

@Component({
  selector: 'app-select-bible-modal',
  templateUrl: './select-bible-modal.component.html',
  styleUrls: ['./select-bible-modal.component.scss'],
})
export class SelectBibleModalComponent {
  @ViewChild('modal') modal: IonModal;
  @Input() triggerId
  @Input() changeViBible = true
  @Input() isOpen: boolean
  @Output() isOpenChange = new EventEmitter<boolean>()
  @Output() bibleSelectedEvent = new EventEmitter<any>()

  constructor(public config: ConfigService,
    public sharedInfo: SharedInfoService,
    public apiService: ApiService,
    private storage: StorageService) { }


  /*ngOnChanges(e){
    //console.log(e)
  }*/

  select(bible) {
    if (this.changeViBible) this.sharedInfo.viBible = copy(bible)
    this.sharedInfo.bible = copy(bible)
    this.bibleSelectedEvent.emit(bible)
    this.modal.dismiss()
  }

  dismiss() {
    this.isOpen = false
    this.isOpenChange.emit(this.isOpen)
  }

}
