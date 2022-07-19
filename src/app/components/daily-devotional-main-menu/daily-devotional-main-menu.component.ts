import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Category } from 'src/app/interfaces/category';
import { Note } from 'src/app/interfaces/note';

@Component({
  selector: 'app-daily-devotional-main-menu',
  templateUrl: './daily-devotional-main-menu.component.html',
  styleUrls: ['./daily-devotional-main-menu.component.scss'],
})
export class DailyDevotionalMainMenuComponent implements OnInit {
  @Input() filterOn
  @Input() categoryList


  constructor() { }

  ngOnInit() {}

  presentNoteModal(note: Note = null){
    /*if(note == null)
      this.addNoteModal.setToNewFunction()
    else
      this.addNoteModal.setToEditFunction(note)
    this.addNoteModal.modal.present()*/
  }

  presentCategoryModal(category: Category = null){
   /* if(category == null)
      this.addCategoryModal.setToNewFunction()
    else
      this.addCategoryModal.setToEditFunction(category)
    this.addCategoryModal.modal.present()*/
  }

  deleteCategory(cat){
   // this.alert.deleteCategoryAlert(cat)
    //this.alert.moveNotesAlert(cat)
  }


}
