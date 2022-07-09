import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-select-bible-modal',
  templateUrl: './select-bible-modal.component.html',
  styleUrls: ['./select-bible-modal.component.scss'],
})
export class SelectBibleModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Input() availableBibles
  @Output() bibleSelectedEvent = new EventEmitter<any>()

  constructor() { }

  ngOnInit() {}

  /*ngOnChanges(e){
    //console.log(e)
  }*/

  select(bible){
    this.bibleSelectedEvent.emit(bible)
    this.modal.dismiss()
  }

}
