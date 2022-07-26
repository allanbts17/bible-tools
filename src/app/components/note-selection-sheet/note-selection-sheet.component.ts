import { Component, OnInit, HostListener, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { Clipboard } from '@capacitor/clipboard';
import { ToastController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { ConfigService } from 'src/app/services/config.service';
import { AddVerseModalComponent } from '../add-verse-modal/add-verse-modal.component';
import { Verse } from 'src/app/interfaces/verse';


@Component({
  selector: 'app-note-selection-sheet',
  templateUrl: './note-selection-sheet.component.html',
  styleUrls: ['./note-selection-sheet.component.scss'],
})
export class NoteSelectionSheetComponent implements OnInit {
  @ViewChild(AddVerseModalComponent) addVerseModal: AddVerseModalComponent;
  @Output() closeSheetEvent = new EventEmitter<any>()
  @Input() bible
  @Input() chapter
  private showCard = false
  passageReference = ''
  selectedData
  verses
  showHighlightColors = false
  selectedMarkerColor
  topicList
  selectedVerse: Verse = {
    topic:0,
    date:"",
    bible:{id:'',reference:""},
    passage:{id:['0'],reference:""},
    text:""
  }

  constructor(public storage: StorageService,
    public toastController: ToastController,
    public config: ConfigService) {}

  ngOnInit() {
    this.onResize();
    this.loadTopics()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
   let card = document.getElementById('note-selection-card')
   //console.log(card)
   card.style.width = String(window.innerWidth - 20) + "px"
  }

  async presentToast(text,duration = 2000) {
    const toast = await this.toastController.create({
      message: text,
      duration: duration
    });
    await toast.present();
    const { role } = await toast.onDidDismiss();
  }

  closeSheet(updateMarks = false){
    this.showCard = false
    this.closeSheetEvent.emit(updateMarks)
  }

  async loadTopics(){
    this.topicList = await this.storage.getData("topics")
  }

  newVerseAdded(){
    this.presentToast('El pasaje ha sido añadido.')
  }

  hideHighlightColor(){
    this.showHighlightColors = false
  }

  async removeStoredHighlightColor(){
    let storedData = await this.storage.getData('marked')
    for(let i=0;i<this.verses.length;i++){

      let verseId = this.chapter.id +'.'+ this.verses[i]
      let searchedData = storedData.find(markedVerse => {
        return markedVerse.verse == verseId
      })

      if(searchedData !== undefined){
        await this.storage.removeItemByID('marked',{id:searchedData.id})
      }
    }
    this.showHighlightColors = false
  }

  async saveHighlightColor(selColor){

    let storedData = await this.storage.getData('marked')
    for(let i=0;i<this.verses.length;i++){
      let data = {
        verse: this.chapter.id +'.'+ this.verses[i],
        color: selColor
      }

      let searchedData = storedData.find(markedVerse => {
        //console.log(markedVerse.verse,data.verse)
        return markedVerse.verse == data.verse
      })
      //console.log('search',searchedData)
      //console.log('store',storedData)

      if(searchedData === undefined){
        //console.log('new',data)
        await this.storage.addData('marked',data)
      } else {
        let newData = {
          id: searchedData.id,
          verse: this.chapter.id +'.'+ this.verses[i],
          color: selColor
        }
        //console.log('edit',newData)
        await this.storage.editItemByID('marked',newData)
      }


      // console.log(data)
    }
    this.showHighlightColors = false
  }

  openAddVerseModal(){
    let text = ''
    this.verses.forEach(verse => {
      const verseSegments = Array.from(document.querySelectorAll('[data-verse-id="'+this.chapter.id+'.'+verse+'"]'))
      var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
      verseSegmentsElementArray.forEach(verseEl => {
        if(!verseEl.children[0]?.classList.contains('v'))
          text += verseEl.innerText +" "
      })
    })
    this.selectedVerse.text = text
    this.selectedVerse.bible = {
      id: this.bible.id,
      reference: this.bible.abbreviationLocal
    }
    this.selectedVerse.passage = {
      id:this.selectedData,
      reference:this.passageReference
    }
    this.addVerseModal.setVerse(this.selectedVerse)
    this.addVerseModal.modal.present()
  }

  async writeToClipboard(){
    let text = ''
    this.verses.forEach(verse => {
      const verseSegments = Array.from(document.querySelectorAll('[data-verse-id="'+this.chapter.id+'.'+verse+'"]'))
      var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
      verseSegmentsElementArray.forEach(verseEl => {
        if(!verseEl.children[0]?.classList.contains('v'))
          text += verseEl.innerText +" "
      })
    })
    text += '\n' + this.passageReference + " " +this.bible.abbreviationLocal
    //console.log(text)
    await Clipboard.write({
      string: text
    });
    this.closeSheet()
    this.presentToast('El texto se ha copiado.')
  }

  async shareData(){
    let text = ''
    this.verses.forEach(verse => {
      const verseSegments = Array.from(document.querySelectorAll('[data-verse-id="'+this.chapter.id+'.'+verse+'"]'))
      var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
      verseSegmentsElementArray.forEach(verseEl => {
        if(!verseEl.children[0]?.classList.contains('v'))
          text += verseEl.innerText +" "
      })
    })
    text += '\n' + this.passageReference + " " +this.bible.abbreviationLocal

    let canShare = await Share.canShare()
    if(canShare.value){
      await Share.share({
        title: this.passageReference,
        text: text,
        dialogTitle: '¡Comparte esperanza!',
      });
      this.closeSheet()
    } else {
      this.presentToast('La acción de compartir no es compatible con este dispositivo.')
    }

  }

  openSheet(data){
    this.updatePassageReference(data)
    this.showCard = true
  }

  getStatus(){
    return this.showCard
  }

  quiteUnseletedColorClass(){
    if(this.selectedMarkerColor != undefined){
      let unselectedMarked =  Array.from(document.getElementsByClassName(this.selectedMarkerColor))
      unselectedMarked.forEach(span => {
        if(!span.classList.contains('selected-verse')){
          span.classList.remove(this.selectedMarkerColor)
        }
      })
    }
  }

  updatePassageReference(data){
    this.verses = []
    let verses = this.verses
    data.forEach(verseInfo => {
      let id = verseInfo.verseId
      let index = id.lastIndexOf(".")+1
      verses.push(id.slice(index))
    })
    this.sortData(verses)
    let versesLength = verses.length
    let verseRanges = []
    this.selectedData = []
    let lastNumberInRange
    for(let i=0;i<versesLength-1;i++){
      if(verses[i+1]-verses[i] == 1){
        //let j = i
        let first = verses[i].slice()
        while(verses[i+1]-verses[i] == 1){
          i += 1
        }
        lastNumberInRange = verses[i]
        verseRanges.push(String(first +"-"+ verses[i]))
        this.selectedData.push(String(this.chapter.id+"."+first +"-"+ this.chapter.id+"."+verses[i]))
        //i = j
      } else {
        verseRanges.push(verses[i])
        this.selectedData.push(this.chapter.id+"."+verses[i])
      }
    }
    if(lastNumberInRange !== verses[versesLength-1]){
      verseRanges.push(verses[versesLength-1])
      this.selectedData.push(this.chapter.id+"."+verses[versesLength-1])
    }
    console.log(verseRanges)
    console.log(this.selectedData)
    this.passageReference = this.chapter.reference +":"+ verseRanges.toString()
    this.quiteUnseletedColorClass()
  }

  sortData(arr){
    arr.sort(function(a, b) {
      return a - b;
    });
  }

  highlightText(color: 'yellow'|'orange'|'red'|'green'|'blue'|'none'){
    let selectedText = document.getElementsByClassName('selected-verse')
    let haveToRemove = false
    //console.log(selectedText)
    for(let i=0;i<selectedText.length;i++){
      let availableColors = ['yellow','orange','red','green','blue']
      let hasAColor = false

      for(let j=0;j<availableColors.length;j++) {
       if(selectedText[i].classList.contains(availableColors[j])){
        if(color!=='none'){
          selectedText[i].classList.replace(availableColors[j],color)
          hasAColor = true
        } else {
          selectedText[i].classList.remove(availableColors[j])
          haveToRemove = true
        }
        break
       }
      }

      if(!hasAColor){
        selectedText[i].classList.add(color)
      }
    }

    if(color == 'none'){
      if(haveToRemove){
        this.removeStoredHighlightColor()
      }
    } else {
      this.saveHighlightColor(color)
    }

    this.showHighlightColors = false
    this.closeSheet(true)
  }

}
