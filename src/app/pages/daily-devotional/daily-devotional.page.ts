import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment'
import { AddNoteModalComponent } from 'src/app/components/add-note-modal/add-note-modal.component';
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { Category } from 'src/app/interfaces/category';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { Note } from 'src/app/interfaces/note';
import { IonPopover, IonSlides, PopoverController } from '@ionic/angular';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { environment } from 'src/environments/environment';
import { formatDate } from 'src/app/classes/utils';

const pagSize = 10
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
  @ViewChild('dailyTabs') myTabs: TabsComponent;
  tabs = []
  categoryList: Category[] = []
  selectedTab: { name: string, id: number }
  filterType: 'all' | 'date' | 'title' | 'text' = 'all'
  searchTerm = ""
  filterOn = false
  showDate = false
  isOpen = false
  notes
  notePages = {}
  slideIndex = 0
  showFab = false
  isAutoScrollingUp = false
  categoryEditSize: string = 'none'
  categoryDeleteSize: string = 'none'
  pageSize

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public popoverController: PopoverController) {
    this.pageSize = environment.pageSize
  }


  ngOnInit() {
    this.loadData()
  }

  async loadData() {
    this.notes = this.storageService.notes
    this.notePages = this.storageService.notePages
    console.log(this.notePages)
    console.log(this.notes)
    this.loadCategories()
    this.addScrollListener()
  }

  async presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }

  onScroll(e) {
    setTimeout(async () => {
      let tab = this.selectedTab
      //this.notePages[tab] += 1
      let empty
      if (this.filterOn)
        empty = this.storageService.filterNotesByParam(this.filterType, this.searchTerm, this.selectedTab)
      else
        empty = await this.storageService.loadMoreNotes(tab) //this.getFilteredNotes(tab)?.slice(pagSize*this.notePages[tab],pagSize*(this.notePages[tab]+1))
      e.target.complete();
      if (empty) {
        e.target.disabled = true;
      }
    }, 500);
  }

  addScrollListener() {
    var lastScrollTop = 0
    var delta = 0
    let myTimeout
    let myInterval = setInterval(() => {
      let scrollSlides = document.getElementsByClassName('scrolled-slide')
      if (scrollSlides.length > 0) {
        clearInterval(myInterval)
        //console.log(scrollSlides)

        for (let i = 0; i < scrollSlides.length; i++) {
          scrollSlides[i].addEventListener('scroll', (e) => {
            let newScrollTop = scrollSlides[i].scrollTop
            if (newScrollTop > lastScrollTop) {
              // downscroll code
              //console.log('down')
              this.showFab = false
              delta = newScrollTop
            } else {
              // upscroll code
              //console.log(delta-newScrollTop)
              if (delta - newScrollTop > 7 && !this.isAutoScrollingUp) {
                this.showFab = true
                clearTimeout(myTimeout)
                myTimeout = setTimeout(() => {
                  this.showFab = false
                }, 3000)
              }// else if (this.isAutoScrollingUp){
              if (newScrollTop === 0) {
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
    }, 50)
  }

  scrollToTop() {
    let scrollSlide = document.getElementById(`slide-${this.selectedTab.name}`)
    scrollSlide.scrollTo(0, 0)
    this.showFab = false
    this.isAutoScrollingUp = true
    //console.log(scrollSlide)
  }

  getStatus() {
    return this.showFab
  }

  async transitionStarted() {
    let index = await this.slides.getActiveIndex()
    this.selectedTab = this.tabs[index]
    this.myTabs.tabSelected(this.selectedTab, index, true)
    this.slideIndex = index
    this.showFab = false
  }

  filterTypeSelect(e) {
    var value = e.detail.value
    console.log(value, this.searchTerm);
    if (this.searchTerm != ""){
      this.storageService.resetNotes()
      this.storageService.filterNotesByParam(value, this.searchTerm, this.selectedTab)
    }

    //if(value == 'date') this.showDate = true
    //  this.showNewCategoryInput = value == "Nuevo"
  }

  searchbarChange(e) {
    this.searchTerm = e.detail.value
    //this.filterNotes()
    console.log(this.searchTerm)
    this.storageService.resetNotes()
    this.storageService.filterNotesByParam(this.filterType, this.searchTerm, this.selectedTab)
  }

  searchbarFocus() {
    if (this.filterType == 'date')
      this.showDate = true
  }

  clearSearchTerm() {
    this.searchTerm = ""
  }

  cancelFilter() {
    this.clearSearchTerm()
    this.filterOn = false
    this.showDate = false
    this.storageService.refillNotes()
  }

  dateSelectionChange(e) {
    var date = e.detail.value
    // var localMoment = moment(date)
    // localMoment.locale('en');
    // var formattedDate = localMoment.format('ll')
    this.searchTerm = formatDate(date)
    console.log(formatDate(date))
    this.storageService.resetNotes()
    this.storageService.filterNotesByParam(this.filterType, formatDate(date), this.selectedTab)
    //this.filterNotes()
    //if(this.filteredNoteList.length > 0) this.showDate = false
  }

  presentNoteModal(note: Note = null) {
    if (note == null)
      this.addNoteModal.setToNewFunction()
    else
      this.addNoteModal.setToEditFunction(note)
    this.addNoteModal.modal.present()
  }

  deleteNote(note: Note) {
    this.alert.noteDeleteConfirmationAlert(note)
  }

  setCategoryEditStyle() {
    let btn = document.getElementById('category-edit')
    let btnRect = btn.getBoundingClientRect()
    let size = window.innerHeight - (btnRect.y + btnRect.height)
    this.categoryEditSize = `${size - 5}px`
  }

  setCategoryDeleteStyle() {
    let btn = document.getElementById('category-delete')
    let btnRect = btn.getBoundingClientRect()
    let size = window.innerHeight - (btnRect.y + btnRect.height)
    this.categoryDeleteSize = `${size - 5}px`
  }


  presentCategoryModal(category: Category = null) {
    if (category == null)
      this.addCategoryModal.setToNewFunction()
    else
      this.addCategoryModal.setToEditFunction(category)
    this.addCategoryModal.modal.present()
  }

  deleteCategory(cat) {
    this.alert.deleteCategoryAlert(cat)
  }

  toogleFilter() {
    this.filterOn = !this.filterOn
    this.showDate = this.filterOn
  }

  async loadCategories(categories?) {
    if (categories)
      this.categoryList = categories
    else
      this.categoryList = await this.storageService.getCategories()
    // setTimeout(()=>{
    //   this.categoryList = this.storageService.categories
    // },800)
    this.fillTabs()
  }

  async sortNotes() {
    await this.storageService.sortData("notes", (a, b) => {
      var ma = moment(a.date)
      var mb = moment(b.date)
      return mb.diff(ma)
    })
  }

  fillTabs() {
    this.tabs.push({ name: 'all', id: -1 })
    if (this.categoryList !== null)
      this.categoryList.forEach(cat => this.tabs.push({ name: cat.category, id: cat.id }))
    this.selectedTab = this.tabs[0]
  }

  tabSelected(e) {
    this.selectedTab = e.tab
    this.slides.slideTo(e.index)
    console.log(this.selectedTab);

    if (this.filterOn){
      this.storageService.resetNotes()
      this.storageService.filterNotesByParam(this.filterType, this.searchTerm, this.selectedTab)
    }

  }

  getFilteredNotes(tab) {
    // if (this.filterOn)
    //   return this.filterByCustomType(this.notes[tab.name])
    // else
    return this.notes[tab.name]
  }

  getPaginatedNotes(tab) {
    // console.log(this.getFilteredNotes(tab).length > this.pageSize);

    return this.notes[tab.name] //this.getFilteredNotes(tab) //?.slice(0,pagSize*(this.notePages[tab]+1))
  }

  filterByCustomType(tabFilteredList) {
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

  formatCardDate(date) {
    var localMoment = moment(date)
    localMoment.locale('es');
    return localMoment.format('LL')
  }


}
