import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';


@Component({
  selector: 'app-daily-devotional',
  templateUrl: './daily-devotional.page.html',
  styleUrls: ['./daily-devotional.page.scss'],
})
export class DailyDevotionalPage implements OnInit {
  @ViewChild('modal') modal: IonModal;
  tabs = []
  testTabs = ['RPSP','Matutina','Lección']
  newNoteSelectedCategory = ""
  newCategoryInput = false
  showColorPicker = false
  selectedColor = "#ffffff"

  constructor(public config: ConfigService) { }


  ngOnInit() {
    this.fillTabs()
    this.setCardStyles()

  }

  addNote(){
    this.modal.dismiss()
  }

  selectColor(color){
    this.selectedColor = color
  }

  handleSelectChange(e){
    var value = e.detail.value
    if(value != "Nuevo"){
      this.newNoteSelectedCategory = value;
      console.log(value)
    } else {
      this.newCategoryInput = true
    }
  }

  addCategory(){

  }

  getCategories(){
    var categories = this.tabs.slice(1)
    categories.push("Nuevo")
    return categories
  }

  setCardStyles(){
    var cards = document.getElementsByTagName("ion-card")
    cards[0].style.color = '#FFF'
    cards[0].style.background = 'rgba(216, 20, 20, 0.333)'
    console.log(cards)
  }

  setAllTab(){
    this.tabs.push(this.config.getData().daly_devotional.tab)
  }

  fillTabs(){
    this.setAllTab()
    this.testTabs.forEach(tab => this.tabs.push(tab))
  }

  tabSelected(tab){
    console.log(tab)
  }



}
