import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
declare var contrast;

@Component({
  selector: 'app-daily-devotional',
  templateUrl: './daily-devotional.page.html',
  styleUrls: ['./daily-devotional.page.scss'],
})
export class DailyDevotionalPage implements OnInit {
  @ViewChild('modal') modal: IonModal;
  tabs = []
  testTabs = ['RPSP','Matutina','Lección']
  newNoteSelectedCategory = ""
  newCategoryInput = false
  showColorPicker = false

  newNoteColor = "#ffffff"
  newNoteTitle = ""
  newNoteText = ""
  newNoteCategory = ""

  categoryList = []
  noteList = [{category:"rpsp",title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  filteredNoteList = [{category:"rpsp",title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  selectedTab = ""

  newCategory = ""

  constructor(public config: ConfigService,public storageService: StorageService) {

  }


  ngOnInit() {
    this.loadCategories()

    this.setCards()
    this.filterNotes(this.selectedTab)
    var d = moment().format('L');
    console.log(d)
  }

  getContrastColor(hex){
    return contrast(hex)
  }

  getCategoryOptions(){
    var cat = this.tabs.slice(1)
    cat.push("Nuevo")
    return cat
  }

  addNote(){
    var note = {
      "color":this.newNoteColor,
      "category":this.newNoteCategory,
      "title":this.newNoteTitle,
      "text":this.newNoteText,
      "date":moment().format('L')
    }

    if(this.newCategoryInput){
      this.addCategories(this.newCategory)
      note.category = this.newCategory
    } else {
      note.color = this.categoryList.filter(cat => cat.category == this.newNoteCategory)[0].color
    }
    this.addNotes(note)
    this.resetNoteValues()
    this.modal.dismiss()
  }

  async addNotes(data){
    await this.storageService.addData('notes',data)
    this.loadNotes()
  }

  async addCategories(data){
    var obj = {
      category:data,
      color:this.newNoteColor
    }
    await this.storageService.addData('categories',obj)
    this.loadCategories()
  }

  async loadCategories(){
    this.categoryList = await this.storageService.getData("categories")
    this.fillTabs()
  }

  selectColor(color){
    this.newNoteColor = color
  }

  handleSelectChange(e){
    var value = e.detail.value
    if(value != "Nuevo"){
      this.newNoteSelectedCategory = value;
      console.log(value)
    } else {
      this.newCategoryInput = true
    }
  }

  async setCards(){
    await this.loadNotes()
  }

  async loadNotes(){
    this.noteList = await this.storageService.getData("notes")
    this.filterNotes(this.selectedTab)
  }

  setAllTab(){

  }

  fillTabs(){
    this.tabs = [this.config.getData().daly_devotional.tab]
    if(this.categoryList !== null)
      this.categoryList.forEach(tab => this.tabs.push(tab.category))
    this.selectedTab = this.tabs[0]
  }

  tabSelected(tab){
    this.selectedTab = tab
    this.filterNotes(tab)
  }

  filterNotes(tab){
    if(tab === this.config.getData().daly_devotional.tab)
      this.filteredNoteList = this.noteList
    else
      this.filteredNoteList = this.noteList.filter(note => note.category === tab)
  }

  resetNoteValues(){
    this.newNoteSelectedCategory = ""
    this.newCategoryInput = false
    this.showColorPicker = false
    this.newNoteColor = "#ffffff"
    this.newNoteTitle = ""
    this.newNoteText = ""
    this.newNoteCategory = ""
    this.newCategory = ""
  }



}
