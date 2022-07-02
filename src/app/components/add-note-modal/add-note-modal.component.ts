import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { Category } from 'src/app/interfaces/category';
import { Note } from 'src/app/interfaces/note';


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
  showRedText = false

  categoryList = []
  selectCategoryName = ""
  newCategory: Category = {
    category:"",
    color:"#fff"
  }
  note: Note = {
    category:0,
    date:"",
    title:"",
    text:""
  }

  constructor(public config: ConfigService, public storageService: StorageService) {
    this.loadCategories()
  }

  ngOnInit() {}


  async saveNote(){
   /* var note = {
      "category":this.noteCategory,
      "title":this.noteTitle,
      "text":this.noteText,
      "date":moment().format('L')
    }*/
    this.note.date = moment().format('L')

    if(this.showNewCategoryInput){
      if(this.newCategory.category != ""){
        var cat = await this.addCategories(this.newCategory)
        this.note.category = cat.id
      }
    } else {
      if(this.selectCategoryName != ""){
        this.note.category = this.categoryList.find(cat => cat.category == this.selectCategoryName).id
      }
    }

    if(this.validateNote()){
      this.addNotes(this.note)
      this.resetNoteValues()
      this.modal.dismiss()
    } else {
      this.showRedText = true
    }

  }

  validateNote(){
    var validTitle = this.note.title != ""
    var validText = this.note.text != ""
    var validCategory = this.note.category != 0
    //var validNewCategory = !(this.showNewCategoryInput && this.newCategory.category == "")
    return validTitle && validText && validCategory
  }

  selectColor(color){
    this.newCategory.color = color
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
    var catArr = await this.storageService.addData('categories',data)
    this.addCategoryEvent.emit()
    this.loadCategories()
    return catArr.slice(-1)[0]
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
    this.showRedText = false
    this.selectCategoryName = ""
    this.newCategory = {
      category:"",
      color:"#fff"
    }
    this.note = {
      category:0,
      date:"",
      title:"",
      text:""
    }
  }

}
