import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { AddNoteModalComponent } from 'src/app/components/add-note-modal/add-note-modal.component';
import { AddCategoryComponent } from 'src/app/components/add-category/add-category.component';
import { CustomAlertComponent } from 'src/app/components/custom-alert/custom-alert.component';
import { IonPopover, PopoverController } from '@ionic/angular';
import { Verse } from 'src/app/interfaces/verse';
import { Topic } from 'src/app/interfaces/topic';
import { AddVerseModalComponent } from 'src/app/components/add-verse-modal/add-verse-modal.component';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { ApiService } from 'src/app/services/api.service';
import { SelectPassageModalComponent } from 'src/app/components/select-passage-modal/select-passage-modal.component';
@Component({
  selector: 'app-verse-index',
  templateUrl: './verse-index.page.html',
  styleUrls: ['./verse-index.page.scss'],
})
export class VerseIndexPage implements OnInit {
  @ViewChild(AddVerseModalComponent) addVerseModal: AddVerseModalComponent;
  @ViewChild(AddCategoryComponent) addTopicModal: AddCategoryComponent;
  @ViewChild(CustomAlertComponent) alert: CustomAlertComponent;
  @ViewChild(SelectPassageModalComponent) selectPassage: SelectPassageModalComponent;
  @ViewChild('popover') popover: IonPopover;

  selectedBible
  selectedChapter
  changeShared = true
  bibles = []
  tabs = []
  topicList = []
  verseList = [{topic:0,bible:{},passage:{},text:"",date:""}]
  filteredVerseList = [{id:1,topic:0,bible:{id:"822u4320j",reference:'RVR09'},passage:{id:"GEN.1.1",reference:'Génesis 1:1'},text:'Amad al Señor',date:""},{id:2,topic:0,bible:{id:"822u4320j",reference:'RVR09'},passage:{id:"GEN.1.1",reference:'Génesis 1:1'},text:'Amad al Señor',date:""}]
  selectedTab = ""
  searchTerm = ""
  filterOn = false
  showDate = false
  isOpen = false
  isOpenBibleModal = false
  selectedVerse

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public popoverController: PopoverController,
    public sharedInfo: SharedInfoService,
    public apiService: ApiService) {}

  ngOnInit() {
    this.loadTopics()
  }

  openBibleModal(verse = undefined){
    if(verse !== undefined){
      this.selectedVerse = {...verse}

    }
    else {
      this.selectedVerse = verse
    }

    //console.log(verse)
    this.isOpenBibleModal = true
  }

  openChapterModal(){
    this.selectPassage.modal.present()
  }

  bibleChange(bible){
    if(this.selectedVerse !== undefined){
      let index = this.filteredVerseList.findIndex(verse => verse.id === this.selectedVerse.id)
      this.filteredVerseList[index].bible = {
        id: bible.id,
        reference: bible.abbreviationLocal
      }
    //console.log(this.selectedVerse)
    } else {
      this.selectedBible = bible
    }
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
    //this.popover.dismiss()
    /*if(verse == null)
      this.addNoteModal.setToNewFunction()
    else
      this.addNoteModal.setToEditFunction(verse)*/
    this.addVerseModal.modal.present()
  }

  presentTopicModal(topic: Topic = null){
    //this.popover.dismiss()
    /*if(topic == null)
      this.addCategoryModal.setToNewFunction()
    else
      this.addCategoryModal.setToEditFunction(topic)*/
    this.addTopicModal.modal.present()
  }

  deleteTopic(topic){
    //this.popover.dismiss()
    this.alert.deleteCategoryAlert(topic)
    ////this.alert.moveNotesAlert(cat)
  }

  clearSearchTerm(){
    this.searchTerm = ""
    this.filterVerses()
  }

  searchbarChange(e){
    this.searchTerm = e.detail.value
    this.filterVerses()
    console.log(this.searchTerm)
  }

  toogleFilter(){
    //this.popover.dismiss()
    this.filterOn=!this.filterOn
  }


  async loadTopics(){
    this.topicList = await this.storageService.getData("topics")
    this.fillTabs()
  }

  async loadVerses(){
    await this.sortVerses()
    this.verseList = await this.storageService.getData("notes")
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
      //this.filteredNoteList = this.noteList.filter(note => note.category === tab)
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
    console.log('')
    if(this.topicList !== null)
      this.topicList.forEach(tab => this.tabs.push(tab.category))
    this.selectedTab = this.tabs[0]
  }

  tabSelected(tab){
    this.selectedTab = tab
    //this.filterNotes(tab)
  }

}
