import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';
import { Topic } from 'src/app/interfaces/topic';

@Component({
  selector: 'app-topic-modal',
  templateUrl: './topic-modal.component.html',
  styleUrls: ['./topic-modal.component.scss'],
})
export class TopicModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Output() addTopicEvent = new EventEmitter<any>()
  @Input() topicList
  newTopic = true
  topic: Topic = {
    name:""
  }

  showEmptyMsg = false
  showUsedMsg = false
  showUsedOnEdit = false
  titleText = {
    new:"Añadir tema",
    edit:"Editar tema"
  }
  labelText = {
    new:"Nuevo tema",
    edit:"Tema"
  }
  actualTitle
  actualLabel
  initialTopicName = ""

  constructor(public config: ConfigService, public storageService: StorageService) {
    //this.loadTopics()
  }

  ngOnInit() {
    this.setTexts()
  }


  setToNewFunction(){
    this.newTopic = true
    this.initialTopicName = ""
    this.setTexts()
    this.resetValues()
  }

  setToEditFunction(topic: Topic){
    this.newTopic = false
    this.setTexts()
    this.topic = {...topic}
    console.log(this.topic)
    this.initialTopicName = topic.name
  }


  setTexts(){
    if(this.newTopic){
      this.actualTitle = this.titleText.new
      this.actualLabel = this.labelText.new
    } else {
      this.actualTitle = this.titleText.edit
      this.actualLabel = this.labelText.edit
    }
  }

  async loadTopics(){
    //this.topicList = await this.storageService.getData("topics")
  }

  async saveTopic(){
    if(this.validateTopic()){
      if(this.newTopic){
        console.log('new topic')
        var arr = await this.storageService.addTopic(this.topic)
        console.log(arr.slice(-1)[0])
      } else {
        //console.log('enter on save edit: ',this.category)
        //await this.storageService.editItemByID('topics',this.topic)
        await this.storageService.editTopic(this.topic,this.initialTopicName)
      }
      this.addTopicEvent.emit()
      this.loadTopics()
      this.modal.dismiss()
    }
  }

  validateTopic(){
    this.showEmptyMsg = this.topic.name == ""
    this.showUsedMsg = this.topicList.find((top) => top.name == this.topic.name) != undefined && this.newTopic
    this.showUsedOnEdit = this.topicList.find((top) => {
      top.name == this.topic.name && this.topic.name != this.initialTopicName
    }) != undefined && !this.newTopic
    console.log('showEmptyMsg: ',this.showEmptyMsg)
    console.log('showUsedMsg: ',this.showUsedMsg)
    console.log('showUsedOnEdit: ',this.showUsedOnEdit)
    return !(this.showEmptyMsg || this.showUsedMsg || this.showUsedOnEdit)
  }

  resetValues(){
    this.topic = {
      name:""
    }
    this.initialTopicName = ""
    this.showEmptyMsg = false
    this.showUsedMsg = false
    this.showUsedOnEdit = false
  }

}
