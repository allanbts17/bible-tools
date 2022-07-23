import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { Category } from 'src/app/interfaces/category';
import { Note } from 'src/app/interfaces/note';
import { Topic } from 'src/app/interfaces/topic';
import { Verse } from 'src/app/interfaces/verse';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { BibleStudyPage } from 'src/app/pages/bible-study/bible-study.page';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-verse-modal',
  templateUrl: './add-verse-modal.component.html',
  styleUrls: ['./add-verse-modal.component.scss'],
})
export class AddVerseModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Output() addVerseEvent = new EventEmitter<any>()
  @Output() addTopicEvent = new EventEmitter<any>()
  @Output() selectBibleEvent = new EventEmitter<any>()
  @Output() selectChapterEvent = new EventEmitter<any>()
  @Input() topicList: Topic[]
  @Input() selectedBible
  @Input() selectedChapter
  newVerse = true
  showNewTopicInput = false
  showRedText = false
  verses = ""
  passageOutput = []
  verseInputTimeout


  selectTopicName = ""
  newTopic: Topic = {
    name:""
  }
  verse: Verse = {
    topic:0,
    date:"",
    bible:{id:0,reference:""},
    passage:{id:0,reference:""},
    text:""
  }

  constructor(public config: ConfigService,
    public storageService: StorageService,
    public sharedInfo: SharedInfoService,
    public apiService: ApiService){ }

  ngOnInit() {}

  selectBible(){
    this.selectBibleEvent.emit()
  }

  selectChapter(){
    this.selectChapterEvent.emit()
  }

  changeVersesInput(text){
    if(this.verseInputTimeout !== undefined){
      clearTimeout(this.verseInputTimeout)
    }
    this.verseInputTimeout = setTimeout(()=>{
      let chId = this.selectedChapter.id
      text = text.replace(/\s+/g, '')
      let arr = text.split(',')
      for(let i=0;i<arr.length;i++){
        let range = arr[i].split('-')
        if(range.length === 2){
          arr[i] = chId+'.'+range[0]+'-'+chId+'.'+range[1]
        } else {
          arr[i] = chId+'.'+arr[i]
        }
      }
      this.passageOutput.length = arr.length
      this.passageOutput.fill(0)
      console.log('test',this.passageOutput)
      for(let i=0;i<arr.length;i++){
        this.getPassage(arr[i],i)
      }

      //console.log(text)
      //console.log(arr)
    },500)

  }

  getPassage(passId,index){
    let aux
    this.apiService.getPassage(this.selectedBible.id,passId).subscribe(data=>{
      aux = data
      this.passageOutput[index] = aux.data.content
      if(!this.passageOutput.some(el => el === 0))
        console.log(this.passageOutput)
    },error=>{
      console.log(error)
    })
  }

  async saveVerse(){
    if(this.newVerse)
      this.verse.date = moment().format('lll')

    if(this.showNewTopicInput){
      if(this.newTopic.name != ""){
        var topic = await this.addTopics(this.newTopic)
        this.verse.topic = topic.id
      }
    } else {
      if(this.selectTopicName != ""){
        this.verse.topic = this.topicList.find(top => top.name == this.selectTopicName).id
      }
    }

    console.log('Before save',this.verse)
    if(this.validateVerse()){
      console.log('enter, newNote',this.newVerse)
      if(this.newVerse)
        this.addVerse(this.verse)
      else
        this.editVerse(this.verse)
      this.resetValues()
      this.modal.dismiss()
    } else {
      this.showRedText = true
    }
  }

  validateVerse(){
    var validText = this.verse.text != ""
    var validTopic = this.verse.topic != 0
    return validText && validTopic
  }

  getTopicOptions(){
    var array = this.topicList.slice()
    array.push({name:"Nuevo"})
    return array
  }

  async addVerse(data){
    await this.storageService.addData('my-verses',data)
    this.addVerseEvent.emit()
  }

  async editVerse(data){
    await this.storageService.editItemByID('my-verses',data)
    this.addVerseEvent.emit()
  }

  async addTopics(data){
    var topArr = await this.storageService.addData('topics',data)
    this.addTopicEvent.emit()
    this.loadTopics()
    return topArr.slice(-1)[0]
  }

  async loadTopics(){
    this.topicList = await this.storageService.getData("topics")
  }

  handleSelectChange(e){
    var value = e.detail.value
    this.showNewTopicInput = value == "Nuevo"
  }

  resetValues(){
    this.showNewTopicInput = false
    this.showRedText = false
    this.selectTopicName = ""
    this.newTopic = {
      name:""
    }
    this.verse = {
      topic:0,
      date:"",
      bible:{id:0,reference:""},
      passage:{id:0,reference:""},
      text:""
    }
  }




}
