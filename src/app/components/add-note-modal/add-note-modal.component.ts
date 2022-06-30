import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'


@Component({
  selector: 'app-add-note-modal',
  templateUrl: './add-note-modal.component.html',
  styleUrls: ['./add-note-modal.component.scss'],
})
export class AddNoteModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Output() addNoteEvent = new EventEmitter<any>()
  @Output() addCategoryEvent = new EventEmitter<any>()
  showNewCategoryInput = false
  showColorPicker = false

  noteColor = "#ffffff"
  noteTitle = ""
  noteText = ""
  noteCategory = ""
  showRedText = false

  categoryList = []
  newCategory = ""
  constructor(public config: ConfigService, public storageService: StorageService) {
    this.loadCategories()
  }

  ngOnInit() {}


  saveNote(){
    var note = {
      "color":this.noteColor,
      "category":this.noteCategory,
      "title":this.noteTitle,
      "text":this.noteText,
      "date":moment().format('L')
    }

    if(this.showNewCategoryInput && this.newCategory != ""){
      this.addCategories(this.newCategory)
      note.category = this.newCategory
    } else {
      if(this.noteCategory != "") note.color = this.categoryList.filter(cat => cat.category == this.noteCategory)[0].color
    }

    if(this.validateNote(note)){
      this.addNotes(note)
      this.resetNoteValues()
      this.modal.dismiss()
    } else {
      this.showRedText = true
    }

  }

  validateNote(note){
    var validTitle = note.title != ""
    var validText = note.text != ""
    var validCategory = note.category != ""
    return validTitle && validText && validCategory
  }

  selectColor(color){
    this.noteColor = color
  }
  getCategoryOptions(){
    var array = this.categoryList.slice()
    array.push({category:"Nuevo"})
    return array
  }

  async addNotes(data){
    await this.storageService.addData('notes',data)
    this.addNoteEvent.emit()
  }

  async addCategories(data){
    var obj = {
      category:data,
      color:this.noteColor
    }
    await this.storageService.addData('categories',obj)
    this.addCategoryEvent.emit()
    this.loadCategories()
  }

  async loadCategories(){
    this.categoryList = await this.storageService.getData("categories")
  }

  handleSelectChange(e){
    var value = e.detail.value
    this.showNewCategoryInput = value == "Nuevo"
  }

  resetNoteValues(){
    this.showNewCategoryInput = false
    this.showColorPicker = false
    this.noteColor = "#ffffff"
    this.noteTitle = ""
    this.noteText = ""
    this.noteCategory = ""
    this.newCategory = ""
    this.showRedText = false
  }

}
