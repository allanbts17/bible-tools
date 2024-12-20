import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment'
import { AddNoteModalComponent } from 'src/app/components/add-note-modal/add-note-modal.component';
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { Category } from 'src/app/interfaces/category';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { Note } from 'src/app/interfaces/note';
import { IonPopover, PopoverController } from '@ionic/angular';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { environment } from 'src/environments/environment';
import { formatDate, log } from 'src/app/classes/utils';
import { Swiper } from 'swiper/types';

const pagSize = 10
@Component({
  selector: 'app-daily-devotional',
  templateUrl: './daily-devotional.page.html',
  styleUrls: ['./daily-devotional.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DailyDevotionalPage implements OnInit {
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;
  @ViewChild(AddNoteModalComponent) addNoteModal: AddNoteModalComponent;
  @ViewChild(AddCategoryComponent) addCategoryModal: AddCategoryComponent;
  @ViewChild(CustomAlertComponent) alert: CustomAlertComponent;
  @ViewChild('popover') popover: IonPopover;

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
  slides: Swiper;
  quit = false
  show = false
  lastFilterType: string = ""
  swiperHeightInterval: any

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public popoverController: PopoverController) {
    this.pageSize = environment.pageSize

  }


  ngOnInit() {
    this.loadData()
  }

  ionViewWillEnter(){
  //  // console.log('ion will enter');
  //   this.swiperHeightInterval =  setInterval(()=>{
  //     let headerHeight = 56
  //     let tabsLimit = document.getElementById("tabs-limit").getBoundingClientRect().height
  //     let contentHeight = window.screen.height - tabsLimit - headerHeight
  //     let swiperHeightContainer = document.getElementById("swiper-height-limit")
  //     swiperHeightContainer.style.height = `${contentHeight}px`
  //    // console.log(swiperHeightContainer.style.height);
      
  //   },200)
  }

  ionViewDidLeave(){
    //console.log('ion did leave');
    clearInterval(this.swiperHeightInterval)
  }

  swiperInit() {
    setTimeout(() => {
      this.slides = this.swiperRef?.nativeElement.swiper;
      console.log('swiperRef', this.slides);
    });
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
      log('scrolled',e)
      //debugger
      if (this.filterOn && this.searchTerm == "")
        empty = await this.storageService.filterNotesByParam(this.filterType, this.searchTerm, this.selectedTab)
      else
        empty = await this.storageService.loadMoreNotes(tab) //this.getFilteredNotes(tab)?.slice(pagSize*this.notePages[tab],pagSize*(this.notePages[tab]+1))
      e.target.complete();
      if (empty) {
        log('empty')
        //e.target.disabled = true;
        tab["disabled"] = true
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

  transitionStarted() {
    let index = this.slides.activeIndex
    this.selectedTab = this.tabs[index]
    this.myTabs.tabSelected(this.selectedTab, index, true)
    this.slideIndex = index
    this.showFab = false
  }

  filterTypeSelect(e) {
    var value = e.detail.value
    console.log(value, this.filterType, this.searchTerm);
    if (this.lastFilterType == 'date' && value != 'date') {
      this.searchTerm = ""
    }
    this.lastFilterType = value
    if (this.searchTerm != "") {
      this.storageService.resetNotes()
      this.storageService.filterNotesByParam(value, this.searchTerm, this.selectedTab)
      this.enableScrolls()
    }

    //if(value == 'date') this.showDate = true
    //  this.showNewCategoryInput = value == "Nuevo"
  }

  searchbarChange(e) {
    this.searchTerm = e.detail.value
    //this.filterNotes()
    console.log('searchbar', this.searchTerm)
    this.storageService.resetNotes()
    this.storageService.filterNotesByParam(this.filterType, this.searchTerm, this.selectedTab)
    this.enableScrolls()
    
  }

  enableScrolls(all = true){
    if(all){
      this.tabs.forEach(tab => tab.disabled = false)
    } else {
      this.tabs.find(tab => tab.name == this.selectedTab.name).disabled = false
    }
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
    // this.showDate = false
    var date = e.detail.value
    // var localMoment = moment(date)
    // localMoment.locale('en');
    // var formattedDate = localMoment.format('ll')
    this.searchTerm = formatDate(date)
    console.log(formatDate(date))
    this.storageService.resetNotes()
    this.storageService.filterNotesByParam(this.filterType, formatDate(date), this.selectedTab)
    this.enableScrolls()
    //this.filterNotes()
    //if(this.filteredNoteList.length > 0) this.showDate = false
    this.hideCalendarAnimation()
  }

  showCalendarAnimation() {
    setTimeout(() => {
      this.show = true
      //this.showDate = false
      setTimeout(() => {
        this.show = false
      }, 200)
    }, 100)
  }

  hideCalendarAnimation() {
    setTimeout(() => {
      this.quit = true
      //this.showDate = false
      setTimeout(() => {
        this.showDate = false
        this.quit = false
      }, 200)
    }, 100)
  }

  showCalendar() {
    this.showDate = true
    this.showCalendarAnimation()
  }

  presentNoteModal(note: Note = null) {
    if (note == null)
      this.addNoteModal.setToNewFunction(this.selectedTab)
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
    // setTimeout(()=>{
    //   this.categoryList = this.storageService.categories
    // },800)
    this.categoryList = categories? categories:await this.storageService.getCategories()
    this.fillTabs()
    setTimeout(() => {
      this.updateSlides()
    }, 200)

  }

  quitFilter() {
    this.filterOn = false
    this.searchTerm = ""
    this.quit = false
    this.show = false
    this.showDate = false
    this.storageService.resetNotes()
    this.storageService.refillNotes()
    this.enableScrolls()
  }

  updateSlides() {
    this.slides.update()
  }

  async sortNotes() {
    await this.storageService.sortData("notes", (a, b) => {
      var ma = moment(a.date)
      var mb = moment(b.date)
      return mb.diff(ma)
    })
  }

  fillTabs() {
    this.tabs.length = 0
    this.tabs.push({ name: 'all', id: -1, disabled: false })
    if (this.categoryList !== null)
      this.categoryList.forEach(cat => this.tabs.push({ name: cat.category, id: cat.id, disabled: false }))
    this.selectedTab = this.tabs[0]
  }

  tabSelected(e) {
    this.selectedTab = e.tab
    this.slides.slideTo(e.index)
    console.log(this.selectedTab);

    if (this.filterOn) {
      //this.storageService.resetNotes()
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
    return this.notes[tab.name]
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
