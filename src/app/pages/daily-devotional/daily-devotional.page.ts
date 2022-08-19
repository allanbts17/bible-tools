import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { AddNoteModalComponent } from 'src/app/components/add-note-modal/add-note-modal.component';
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { Category } from 'src/app/interfaces/category';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { Note } from 'src/app/interfaces/note';
import { IonInfiniteScroll, IonPopover, IonSegment, IonSlides, PopoverController } from '@ionic/angular';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';

@Component({
  selector: 'app-daily-devotional',
  templateUrl: './daily-devotional.page.html',
  styleUrls: ['./daily-devotional.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DailyDevotionalPage implements OnInit {
  @ViewChild(AddNoteModalComponent) addNoteModal: AddNoteModalComponent;
  @ViewChild(AddCategoryComponent) addCategoryModal: AddCategoryComponent;
  @ViewChild(CustomAlertComponent) alert: CustomAlertComponent;
  @ViewChild('popover') popover: IonPopover;
  @ViewChild('slide') slides: IonSlides;
  @ViewChild('segment') segment: IonSegment;
  @ViewChild('dailyTabs') myTabs: TabsComponent;
  //@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll
  tabs = []
  categoryList = []
  noteList = [{category:0,title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  filteredNoteList = [{category:0,title:"Mens",text:"este es un texto",color:"#fff",date:""}]
  selectedTab = ""
  filterType: 'all' | 'date' | 'title' | 'text' = 'all'
  searchTerm = ""
  filterOn = false
  showDate = false
  isOpen = false
  notes
  notePages = {}
  slideIndex = 0
  checked
  showFab = false
  isAutoScrollingUp = false

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public popoverController: PopoverController) {}


  ngOnInit() {
    this.loadData()

    //this.loadNotes()
    //this.filterNotes(this.selectedTab)
  }

  async loadData(){
    this.notes = await this.storageService.getNotes(null,0)
    for (const item in this.notes) {
      Object.assign(this.notePages,{[item]:0})
    }
    console.log(this.notePages)
    console.log(this.notes)
    this.loadCategories()
    this.addScrollListener()
  }

  async presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }

  onScroll(e){
    setTimeout(async () => {
      let tab = this.selectedTab === this.config.getData().daly_devotional.tab? 'all':this.selectedTab
      this.notePages[tab] += 1
      let newData = await this.storageService.getNotes(tab,this.notePages[tab])
      this.notes[tab].push(...newData)
      //console.log(newData)
      e.target.complete();
      //let scrollSlide = document.getElementById(`slide-${this.selectedTab}`)
      console.log('size: ',newData.length)
      if(newData.length === 0){
        e.target.disabled = true;
      }
    }, 500);
  }

  addScrollListener(){
    var lastScrollTop = 0
    var delta = 0
    let myTimeout
    let myInterval = setInterval(()=>{
      let scrollSlides = document.getElementsByClassName('scrolled-slide')
      if(scrollSlides.length > 0){
        clearInterval(myInterval)
        //console.log(scrollSlides)

        for(let i=0;i<scrollSlides.length;i++){
          scrollSlides[i].addEventListener('scroll', (e) => {
            let newScrollTop = scrollSlides[i].scrollTop
            if (newScrollTop > lastScrollTop){
              // downscroll code
              //console.log('down')
              this.showFab = false
              delta = newScrollTop
            } else {
                // upscroll code
                //console.log(delta-newScrollTop)
                if(delta-newScrollTop > 7 && !this.isAutoScrollingUp){
                  this.showFab = true
                  clearTimeout(myTimeout)
                  myTimeout = setTimeout(()=>{
                    this.showFab = false
                  },3000)
                }// else if (this.isAutoScrollingUp){
                if(newScrollTop === 0){
                  clearTimeout(myTimeout)
                  this.showFab = false
                  this.isAutoScrollingUp = false
                }
                //}
            }
            //console.log(,newScrollTop)
            lastScrollTop = newScrollTop <= 0 ? 0 : newScrollTop; // For Mobile or negative scrolling
          })
        }
      }
    },50)
  }

  scrollToTop(){
    let scrollSlide = document.getElementById(`slide-${this.selectedTab}`)
    scrollSlide.scrollTo(0,0)
    this.showFab = false
    this.isAutoScrollingUp = true
    //console.log(scrollSlide)
  }

  getStatus(){
    return this.showFab
  }

  async transitionStarted(){
    let index = await this.slides.getActiveIndex()
    this.selectedTab = this.tabs[index]
    this.myTabs.tabSelected(this.selectedTab,index,true)
    this.slideIndex = index
    this.showFab = false
  }

  filterTypeSelect(e){
    var value = e.detail.value
    //if(value == 'date') this.showDate = true
  //  this.showNewCategoryInput = value == "Nuevo"
  }

  searchbarChange(e){
    this.searchTerm = e.detail.value
    //this.filterNotes()
    console.log(this.searchTerm)
  }

  searchbarFocus(){
    if(this.filterType == 'date')
      this.showDate = true
  }

  clearSearchTerm(){
    this.searchTerm = ""
    //this.filterNotes()
  }

  cancelFilter(){
    this.clearSearchTerm()
    this.filterOn = false
    this.showDate = false
  }

  dateSelectionChange(e){
    var date = e.detail.value
    var localMoment = moment(date)
    localMoment.locale('es');
    var formattedDate = localMoment.format('LL')
    this.searchTerm = formattedDate
    console.log(this.searchTerm)
    //this.filterNotes()
    if(this.filteredNoteList.length > 0) this.showDate = false
  }

  presentNoteModal(note: Note = null){
    //this.popover.dismiss()
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
    //this.popover.dismiss()
    if(category == null)
      this.addCategoryModal.setToNewFunction()
    else
      this.addCategoryModal.setToEditFunction(category)
    this.addCategoryModal.modal.present()
  }

  deleteCategory(cat){
    //this.popover.dismiss()
    this.alert.deleteCategoryAlert(cat)
    //this.alert.moveNotesAlert(cat)
  }

  toogleFilter(){
    //this.popover.dismiss()
    this.filterOn=!this.filterOn
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

  async loadNotes(data){
    await this.sortNotes()
    //this.noteList = await this.storageService.getData("notes")
    //let newData = await this.storageService.getNotes(category,this.notePages[category])
    this.notes[data.categoryName].unshift(data.data)
    this.notes.all.unshift(data.data)
    console.log('newData',data)
    //this.filterNotes(this.selectedTab)
  }

  fillTabs(){
    this.tabs = [this.config.getData().daly_devotional.tab]
    if(this.categoryList !== null)
      this.categoryList.forEach(tab => this.tabs.push(tab.category))
    this.selectedTab = this.tabs[0]
  }

  tabSelected(e){
    this.selectedTab = e.tab
    //this.filterNotes(e.tab)
    this.slides.slideTo(e.index)
  }

  /*filterNotes(tab=this.selectedTab){
    if(this.filterOn){
      var tabFilteredList = this.filterByCategory(tab)
      this.filteredNoteList = this.filterByCustomType(tabFilteredList)
    } else{
      this.filteredNoteList = this.filterByCategory(tab)
    }
  }*/

  getFilteredNotes(tab){
    if(this.filterOn)
      return this.filterByCustomType(this.notes[tab])
    else
      return this.notes[tab]
  }

  /*filterByCategory(tab){
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
  }*/

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
          filtered = tabFilteredList.filter(note => this.formatCardDate(note.date).toUpperCase().includes(this.searchTerm.toUpperCase()))
          break;
      case 'all':
        filtered = tabFilteredList.filter(note => {
          var found = note.title.toUpperCase().includes(this.searchTerm.toUpperCase()) ||
          note.text.toUpperCase().includes(this.searchTerm.toUpperCase()) ||
          this.formatCardDate(note.date).toUpperCase().includes(this.searchTerm.toUpperCase())
          return found
        })
        break;
    }
    return filtered
  }

  formatCardDate(date){
    var localMoment = moment(date)
    localMoment.locale('es');
    return localMoment.format('LL')
  }


}
