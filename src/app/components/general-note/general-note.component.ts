import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
//import { PopoverController } from '@ionic/angular';
declare var contrast;
import  * as moment  from 'moment'
import { Note } from 'src/app/interfaces/note';

@Component({
  selector: 'app-general-note',
  templateUrl: './general-note.component.html',
  styleUrls: ['./general-note.component.scss'],
})
export class GeneralNoteComponent implements OnInit {
  @Input() note: Note
  @Input() index
  @Input() categories
  @Output() noteDeleteEvent = new EventEmitter<Note>()
  @Output() noteEditEvent = new EventEmitter<Note>()

  touched = false

  constructor(/*public popoverController: PopoverController*/) { }

  ngOnInit() {
    //console.log(this.index)
  }

  getCategoryValues(){
    //console.log('param: ',prop,'categories: ',this.categories,'note: ',this.note)
    const category = this.categories.find(cat => cat.id == this.note.category)
    return category
  }

  formatCardDate(date){
    var localMoment = moment(date)
    localMoment.locale('es');
    return localMoment.format('LL')
  }

  getContrastColor(){
    return contrast(this.getCategoryValues()?.color)
  }

}
