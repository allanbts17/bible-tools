import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
declare var contrast;
import  * as moment  from 'moment'

@Component({
  selector: 'app-general-note',
  templateUrl: './general-note.component.html',
  styleUrls: ['./general-note.component.scss'],
})
export class GeneralNoteComponent implements OnInit {
  @Input() note
  @Input() index
  @Input() categories
  touched = false

  constructor(public popoverController: PopoverController) { }

  ngOnInit() {}

  getCategoryValues(){
    //console.log('param: ',prop,'categories: ',this.categories,'note: ',this.note)
    const category = this.categories.find(cat => cat.id == this.note.category)
    return category
  }



  menuPressed(){
    this.touched = true
  }

  menuReleased(){
    this.touched = false
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
