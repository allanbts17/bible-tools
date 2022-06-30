import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { AddNoteModalComponent } from 'src/app/components/add-note-modal/add-note-modal.component';
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { Category } from 'src/app/interfaces/category';


@Component({
  selector: 'app-daily-devotional',
  templateUrl: './daily-devotional.page.html',
  styleUrls: ['./daily-devotional.page.scss'],
})
export class DailyDevotionalPage implements OnInit {
  @ViewChild(AddNoteModalComponent) addNoteModal: AddNoteModalComponent;
  @ViewChild(AddCategoryComponent) addCategoryModal: AddCategoryComponent;
  tabs = []
  categoryList = []
  noteList = [{category:"rpsp",title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  filteredNoteList = [{category:"rpsp",title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  selectedTab = ""

  constructor(public config: ConfigService,
    public storageService: StorageService) {}


  ngOnInit() {
    this.loadCategories()
    this.loadNotes()
    this.filterNotes(this.selectedTab)

    let g:any = {}

    g.n = "prueba"

  }

  presentNoteModal(){
    this.addNoteModal.modal.present()
  }

  presentCategoryModal(category: Category = null){
    if(category == null)
      this.addCategoryModal.setToNewFunction()
    else
      this.addCategoryModal.setToEditFunction(category)
    this.addCategoryModal.modal.present()
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

  filterNotes(tab){
    if(tab === this.config.getData().daly_devotional.tab)
      this.filteredNoteList = this.noteList
    else
      this.filteredNoteList = this.noteList.filter(note => note.category === tab)
  }


}
