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
  @Input() categoryList: Category[]
  newNote = true
  showNewCategoryInput = false
  showColorPicker = false
  showRedText = false

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

  titleText = {
    new:"Añadir nota",
    edit:"Editar nota"
  }
  actualTitle
  prevCategory: string;

  constructor(public config: ConfigService, public storageService: StorageService) {
    //this.loadCategories()
    /*var today = moment().format('ll')
    var alsoToday  = moment().format('lll')
    console.log('today: ',today)
    console.log('today another hour: ',alsoToday)

    var ma = moment(today)
    var mb = moment(alsoToday)
    console.log('difference: ',ma.diff(mb))

    var localMoment = moment(today)
    localMoment.locale('es');
    console.log('Hoy: ',localMoment.format('LL'))*/
  }

  ngOnInit() {
    this.setTitle()
  }

  setTitle(){
    if(this.newNote){
      this.actualTitle = this.titleText.new
    } else {
      this.actualTitle = this.titleText.edit
    }
  }

  setToNewFunction(){
    this.newNote = true
    this.setTitle()
    this.resetValues()
  }

  setToEditFunction(note: Note){
    this.newNote = false
    this.setTitle()
    this.showNewCategoryInput = false
    this.selectCategoryName = this.categoryList.find(cat => cat.id == note.category).category
    this.prevCategory = this.selectCategoryName
    this.note = {...note}
    console.log(this.note)
   // this.initialCategoryName = category.category
  }


  async saveNote(){
    let noteCategoryName
    if(this.newNote)
      this.note.date = moment().format('lll')

    if(this.showNewCategoryInput){
      if(this.newCategory.category != ""){
        var cat = await this.addCategories(this.newCategory)
        noteCategoryName = cat.category
        this.note.category = cat.id
      }
    } else {
      if(this.selectCategoryName != ""){
        let category = this.categoryList.find(cat => cat.category == this.selectCategoryName)
        this.note.category = category.id
        noteCategoryName = category.category
      }
    }

    console.log('Before save',this.note)

    if(this.validateNote()){
      console.log('enter, newNote',this.newNote)
      if(this.newNote)
        await this.addNote(this.note,noteCategoryName)
      else
        await this.editNote(this.note,noteCategoryName)
      this.resetValues()
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
    array.push({category:"Nuevo",color:""})
    return array
  }

  async addNote(data,category){
    console.log('added note: ',data,category)
    await this.storageService.addNote(data,category)
    this.addNoteEvent.emit()
  }

  async editNote(data,category){
    await this.storageService.editNote(data,this.prevCategory)
    //await this.storageService.editItemByID('notes',data)
    this.addNoteEvent.emit()
  }

  async addCategories(data){
    //var catArr = await this.storageService.addData('categories',data)
    var catArr = await this.storageService.addCategories(data)
    this.addCategoryEvent.emit(catArr)
    this.loadCategories()
    console.log('newCat',catArr,catArr.slice(-1)[0]);

    return catArr.slice(-1)[0]
  }

  async loadCategories(){
    //this.categoryList = await this.storageService.getData("categories")
  }

  handleSelectChange(e){
    var value = e.detail.value
    this.showNewCategoryInput = value == "Nuevo"
  }

  resetValues(){
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
