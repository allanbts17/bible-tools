import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { IonPopover, IonSlides, PopoverController, ToastController } from '@ionic/angular';
import { Verse } from 'src/app/interfaces/verse';
import { Topic } from 'src/app/interfaces/topic';
import { AddVerseModalComponent } from 'src/app/components/add-verse-modal/add-verse-modal.component';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { ApiService } from 'src/app/services/api.service';
import { SelectPassageModalComponent } from 'src/app/components/select-passage-modal/select-passage-modal.component';
import { TopicModalComponent } from 'src/app/components/topic-modal/topic-modal.component';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { TestObject } from 'protractor/built/driverProviders';

const pagSize = 10
@Component({
  selector: 'app-verse-index',
  templateUrl: './verse-index.page.html',
  styleUrls: ['./verse-index.page.scss'],
})
export class VerseIndexPage implements OnInit {
  @ViewChild(AddVerseModalComponent) addVerseModal: AddVerseModalComponent;
  @ViewChild(TopicModalComponent) addTopicModal: TopicModalComponent;
  @ViewChild(CustomAlertComponent) alert: CustomAlertComponent;
  @ViewChild(SelectPassageModalComponent) selectPassage: SelectPassageModalComponent;
  @ViewChild('popover') popover: IonPopover;
  @ViewChild('slide') slides: IonSlides;
  @ViewChild('dailyTabs') myTabs: TabsComponent;

  selectedBible
  selectedChapter
  changeShared = true
  bibles = []
  tabs = []
  topicList = []
  verseList: Verse[] //[{topic:0,bible:{id:'',reference:''},passage:{},text:"",date:""}]
  filteredVerseList: Verse[]// = [{id:1,topic:0,bible:{id:"822u4320j",reference:'RVR09'},passage:{id:"GEN.1.1",reference:'Génesis 1:1'},text:'Amad al Señor',date:""},{id:2,topic:0,bible:{id:"822u4320j",reference:'RVR09'},passage:{id:"GEN.1.1",reference:'Génesis 1:1'},text:'Amad al Señor',date:""}]
  selectedTab = ""
  searchTerm = ""
  filterOn = false
  showDate = false
  isOpen = false
  isOpenBibleModal = false
  selectedVerse: Verse
  seletedVersePassage = []
  slideIndex = 0
  showFab = false
  verses
  versePages = {}
  isAutoScrollingUp = false
  testArr = []

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public popoverController: PopoverController,
    public sharedInfo: SharedInfoService,
    public apiService: ApiService,
    public toastController: ToastController) {
      console.log('tesssst: ',this.testArr)
      setTimeout(()=>{
        //this.testArr =  [1,2,3,4]
        let ff = [1,2,3,4]
        this.testArr.push(...ff)
        //Object.assign(this.testObj,{'prop3':'Its prop 3'})
        //this.testObj.prop1 = 'not'
      },300)
    }

  ngOnInit() {
    this.loadData()


    //this.loadTopics()
    //this.loadVerses()
  }

  async loadData(){
    this.verses = this.storageService.verses
    this.versePages = this.storageService.versePages
    console.log(this.versePages)
    console.log(this.verses)
    this.loadTopics()
    this.addScrollListener()
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  openBibleModal(verse = undefined){
    if(verse !== undefined){
      this.selectedVerse = {...verse}
    }
    else {
      this.selectedVerse = undefined
    }
    //console.log(verse)
    this.isOpenBibleModal = true
  }

  openChapterModal(){
    this.selectPassage.modal.present()
  }

  bibleChange(bible){
    if(this.selectedVerse !== undefined){
      //let index = this.filteredVerseList.findIndex(verse => verse.id === this.selectedVerse.id)
      this.seletedVersePassage.length = this.selectedVerse.passage.id.length
      this.seletedVersePassage.fill(0)

      for(let i=0;i<this.selectedVerse.passage.id.length;i++){
        this.getPassage(bible,this.selectedVerse.passage.id[i],i)
      }
    //console.log(this.selectedVerse)
    } else {
      this.selectedBible = bible
    }
  }

  getPassage(bible,passId,index){
    let aux
    this.apiService.getPassage(bible.id,passId).subscribe(data=>{
      aux = data
      this.seletedVersePassage[index] = aux.data.content
      if(!this.seletedVersePassage.some(el => el === 0))
        this.buildOutputText(bible)
    },error=>{
      if(error.status === 404){
        this.presentToast('El pasaje no se encuentra en esta versión')
      } else {
        console.log(error)
      }
    })
  }

  async buildOutputText(bible){
    let outputText = ''
    this.seletedVersePassage.forEach(verseRange => {
      var container = document.createElement('div')
      container.insertAdjacentHTML('beforeend',verseRange)
      let spans = container.querySelectorAll('span.verse-span')
      spans.forEach(span => {
        if(span.childNodes[0].nodeType === 3){
          let text = span.childNodes[0].textContent
          if(text.slice(-1) != ' '){
            text += ' '
          }
          outputText += text
        }
      })
    })
    this.selectedVerse.bible = {
      id:bible.id,
      reference:bible.abbreviationLocal
    }
    this.selectedVerse.text = outputText
    await this.editVerse(this.selectedVerse)
    this.loadVerses()
  }

  async editVerse(data){
    await this.storageService.editItemByID('my-verses',data)
  }

  chapterChange(chapter){
    this.selectedChapter = chapter
    //this.sharedInfo.defaultChapter = this.selectedChapter
  }

  async presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }

  presentVerseModal(){
    this.addVerseModal.modal.present()
  }

  presentTopicModal(topic: Topic = null){
    //this.popover.dismiss()
    if(topic == null)
      this.addTopicModal.setToNewFunction()
    else
      this.addTopicModal.setToEditFunction(topic)
    this.addTopicModal.modal.present()
  }

  deleteTopic(topic){
    //this.popover.dismiss()
    this.alert.deleteTopicAlert(topic)
    ////this.alert.moveNotesAlert(cat)
  }

  deleteVerse(verse: Verse){
    this.alert.verseDeleteConfirmationAlert(verse)
  }

  clearSearchTerm(){
    this.searchTerm = ""
    this.filterVerses()
  }

  quiteFilter(){
    this.filterOn = false
    this.clearSearchTerm()
  }

  searchbarChange(e){
    this.searchTerm = e.detail.value
    this.filterVerses()
    console.log(this.searchTerm)
  }

  toogleFilter(){
    //this.popover.dismiss()
    this.filterOn=!this.filterOn
    if(!this.filterOn)
      this.quiteFilter()
  }


  async loadTopics(){
    this.topicList = await this.storageService.getTopics()
    setTimeout(()=>{
      this.topicList = this.storageService.topics
    },800)
    this.fillTabs()
  }

  async loadVerses(){
    /*await this.sortVerses()
    this.verseList = await this.storageService.getData("my-verses")
    this.filterVerses(this.selectedTab)*/
  }

  /*async sortVerses(){
    await this.storageService.sortData("my-verses",(a,b)=>{
      var ma = moment(a.date)
      var mb = moment(b.date)
      return mb.diff(ma)
    })
  }*/

  filterVerses(tab = this.selectedTab){
    if(this.filterOn){
      var tabFilteredList = this.filterByCategory(tab)
      this.filteredVerseList = this.filterByCustomType(tabFilteredList)
    } else{
      this.filteredVerseList = this.filterByCategory(tab)
    }

  }

  filterByCategory(tab){
    var filtered
    if(tab === this.config.getData().daly_devotional.tab){
      filtered = this.verseList
    } else {
      filtered = this.verseList.filter(verse => {
        var topic = this.topicList.find(topic => {
          return topic.id == verse.topic
        })?.name
        return topic === tab
      })
    }
    return filtered
  }

  filterByCustomType(tabFilteredList){
    var filtered
    filtered = tabFilteredList.filter(verse => {
      var found = verse.text.toUpperCase().includes(this.searchTerm.toUpperCase()) ||
      verse.bible.reference.toUpperCase().includes(this.searchTerm.toUpperCase()) ||
      verse.passage.reference.toUpperCase().includes(this.searchTerm.toUpperCase())
      return found
    })
    return filtered
  }

  getTabs(){
    return ['all'].concat(this.topicList)
  }

  getFilteredVerses(tab){
    if(this.filterOn)
      return this.filterByCustomType(this.verses[tab])
    else
      return this.verses[tab]
  }

  fillTabs(){
    this.tabs = ['all']//[this.config.getData().daly_devotional.tab]
    if(this.topicList !== null)
      this.topicList.forEach(tab => this.tabs.push(tab.name))
    this.selectedTab = this.tabs[0]
    //console.log(this.tabs)
    console.log('tabs: ',this.tabs)
    setTimeout(()=>console.log('topics',this.topicList),1000)
    setTimeout(()=>console.log('service',this.storageService.topics),1000)
  }

  tabSelected(e){
    this.selectedTab = e.tab
    //this.filterVerses(tab)
    this.slides.slideTo(e.index)
  }

  async transitionStarted(){
    let index = await this.slides.getActiveIndex()
    this.selectedTab = this.tabs[index]
    this.myTabs.tabSelected(this.selectedTab,index,true)
    this.slideIndex = index
    this.showFab = false
  }

  getPaginatedVerses(tab){
    return this.getFilteredVerses(tab)?.slice(0,pagSize*(this.versePages[tab]+1))
  }


  onScroll(e){
    setTimeout(async () => {
      let tab = this.selectedTab
      this.versePages[tab] += 1
      let newData = this.getFilteredVerses(tab)?.slice(pagSize*this.versePages[tab],pagSize*(this.versePages[tab]+1))
      e.target.complete();
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
      let scrollSlides = document.getElementsByClassName('scrolled-slide-verses')
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
    let scrollSlide = document.getElementById(`slide-${this.selectedTab}-verses`)
    scrollSlide.scrollTo(0,0)
    this.showFab = false
    this.isAutoScrollingUp = true
    //console.log(scrollSlide)
  }

  getStatus(){
    return this.showFab
  }

}
