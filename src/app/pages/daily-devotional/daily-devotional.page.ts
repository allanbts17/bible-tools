import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { AddNoteModalComponent } from 'src/app/components/add-note-modal/add-note-modal.component';
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { Category } from 'src/app/interfaces/category';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { Note } from 'src/app/interfaces/note';


@Component({
  selector: 'app-daily-devotional',
  templateUrl: './daily-devotional.page.html',
  styleUrls: ['./daily-devotional.page.scss'],
})
export class DailyDevotionalPage implements OnInit {
  @ViewChild(AddNoteModalComponent) addNoteModal: AddNoteModalComponent;
  @ViewChild(AddCategoryComponent) addCategoryModal: AddCategoryComponent;
  @ViewChild(CustomAlertComponent) alert: CustomAlertComponent;
  tabs = []
  categoryList = []
  noteList = [{category:0,title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  filteredNoteList = [{category:0,title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  selectedTab = ""
  filterType: 'all' | 'date' | 'title' | 'text' = 'all'
  searchTerm = ""
  filterOn = false

  constructor(public config: ConfigService,
    public storageService: StorageService) {}


  ngOnInit() {
    this.loadCategories()
    this.loadNotes()
    this.filterNotes(this.selectedTab)
  }

  filterTypeSelect(e){
   // var value = e.detail.value
  //  this.showNewCategoryInput = value == "Nuevo"
  }

  searchbarChange(e){
    this.searchTerm = e.detail.value
    if(this.filterType != 'date') this.filterNotes()
    console.log(this.searchTerm)
  }

  presentNoteModal(note: Note = null){
    if(note == null)
      this.addNoteModal.setToNewFunction()
    else
      this.addNoteModal.setToEditFunction(note)
    this.addNoteModal.modal.present()
  }

  deleteNote(note: Note){
    this.alert.noteDeleteConfirmationAlert(note)
  }


  presentCategoryModal(category: Category = null){
    if(category == null)
      this.addCategoryModal.setToNewFunction()
    else
      this.addCategoryModal.setToEditFunction(category)
    this.addCategoryModal.modal.present()
  }

  deleteCategory(cat){
    this.alert.deleteCategoryAlert(cat)
    //this.alert.moveNotesAlert(cat)
  }

  async loadCategories(){
    this.categoryList = await this.storageService.getData("categories")
    this.fillTabs()
  }

  async sortNotes(){
    await this.storageService.sortData("notes",(a,b)=>{
      var ma = moment(a.date)
      var mb = moment(b.date)
      return mb.diff(ma)
    })
  }
  async loadNotes(){
    await this.sortNotes()
    this.noteList = await this.storageService.getData("notes")
    this.filterNotes(this.selectedTab)
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

  filterNotes(tab=this.selectedTab){
    if(this.filterOn){
      var tabFilteredList = this.filterByCategory(tab)
      console.log("filtered by cat: ",tabFilteredList)
      this.filteredNoteList = this.filterByCustomType(tabFilteredList)
    } else{
      this.filteredNoteList = this.filterByCategory(tab)
    }

  }

  filterByCategory(tab){
    var filtered
    if(tab === this.config.getData().daly_devotional.tab){
      filtered = this.noteList
    } else {
      //this.filteredNoteList = this.noteList.filter(note => note.category === tab)
      filtered = this.noteList.filter(note => {
        var cat = this.categoryList.find(cat => {
          return cat.id == note.category
        })?.category
        return cat === tab
      })
    }
    return filtered
  }

  filterByCustomType(tabFilteredList){
    var filtered
    switch (this.filterType) {
      case 'title':
        filtered = tabFilteredList.filter(note => note.title.toUpperCase().includes(this.searchTerm.toUpperCase()))
        break;
      case 'text':
        filtered = tabFilteredList.filter(note => note.text.toUpperCase().includes(this.searchTerm.toUpperCase()))
        break;
      case 'date':
          break;
      case 'all':
        filtered = tabFilteredList.filter(note => {
          note.title.toUpperCase().includes(this.searchTerm.toUpperCase()) ||
          note.text.toUpperCase().includes(this.searchTerm.toUpperCase()) ||
          note.date.toUpperCase().includes(this.searchTerm.toUpperCase())
        })
        break;
    }
    return filtered
  }


}
