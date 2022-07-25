import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import  * as moment  from 'moment'
import { Topic } from 'src/app/interfaces/topic';
import { Verse } from 'src/app/interfaces/verse';
import { SharedInfoService } from 'src/app/services/shared-info.service';
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
  @Output() passageOutputEvent = new EventEmitter<any>()
  @Input() topicList: Topic[]
  @Input() selectedBible
  @Input() selectedChapter
  newVerse = true
  showNewTopicInput = false
  showRedText = false
  verses = ""
  passageOutput = []
  verseInputTimeout
  passageText


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

  ngOnChanges(ch){
    let bibleChanged = ch?.selectedBible !== undefined
    let chapterChanged = ch?.selectedChapter !== undefined
    let inputStarted = this.verses !== ""
    if((bibleChanged || chapterChanged) && inputStarted){
      this.changeVersesInput(this.verses)
    }
  }

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

      /** Fill passage and bible parameters */
      this.verse.passage.id = arr.slice(0)
      this.verse.passage.reference = this.selectedChapter.reference +':'+ text
      this.verse.bible.id = this.selectedBible.id
      this.verse.bible.reference = this.selectedBible.abbreviationLocal
      //console.log(this.selectedBible)
      //console.log(this.verse.passage.reference)
      //console.log('test',this.passageOutput)
      for(let i=0;i<arr.length;i++){
        this.getPassage(arr[i],i)
      }
    },500)
  }

  getPassage(passId,index){
    let aux
    this.apiService.getPassage(this.selectedBible.id,passId).subscribe(data=>{
      aux = data
      this.passageOutput[index] = aux.data.content
      if(!this.passageOutput.some(el => el === 0))
        this.buildOutputText()
    },error=>{
      console.log(error)
    })
  }

  buildOutputText(){
    let outputText = ''
   // let arr = []
    this.passageOutput.forEach(verseRange => {
      var container = document.createElement('div')
      container.insertAdjacentHTML('beforeend',verseRange)
      let spans = container.querySelectorAll('span.verse-span')
      spans.forEach(span => {
        if(span.childNodes[0].nodeType === 3){
          let text = span.childNodes[0].textContent
          if(text.slice(-1) != ' '){
            text += ' '
          }
          //arr.push(text)
          outputText += text
          //console.log(span.childNodes[0])
        }
      })
    })
    this.passageText = outputText
    this.verse.text = outputText
    //this.passageOutputEvent.emit(outputText)
    //console.log(outputText)
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
