import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { IonPopover, PopoverController, ToastController } from '@ionic/angular';
import { Verse } from 'src/app/interfaces/verse';
import { Topic } from 'src/app/interfaces/topic';
import { AddVerseModalComponent } from 'src/app/components/add-verse-modal/add-verse-modal.component';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { ApiService } from 'src/app/services/api.service';
import { SelectPassageModalComponent } from 'src/app/components/select-passage-modal/select-passage-modal.component';
import { TopicModalComponent } from 'src/app/components/topic-modal/topic-modal.component';
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

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public popoverController: PopoverController,
    public sharedInfo: SharedInfoService,
    public apiService: ApiService,
    public toastController: ToastController) {}

  ngOnInit() {
    this.loadTopics()
    this.loadVerses()
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
    this.topicList = await this.storageService.getData("topics")
    this.fillTabs()
  }

  async loadVerses(){
    await this.sortVerses()
    this.verseList = await this.storageService.getData("my-verses")
    this.filterVerses(this.selectedTab)
  }

  async sortVerses(){
    await this.storageService.sortData("my-verses",(a,b)=>{
      var ma = moment(a.date)
      var mb = moment(b.date)
      return mb.diff(ma)
    })
  }

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

  fillTabs(){
    this.tabs = [this.config.getData().daly_devotional.tab]
    if(this.topicList !== null)
      this.topicList.forEach(tab => this.tabs.push(tab.name))
    this.selectedTab = this.tabs[0]
    //console.log(this.tabs)
  }

  tabSelected(tab){
    this.selectedTab = tab
    this.filterVerses(tab)
  }

}
