import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-note-selection-sheet',
  templateUrl: './note-selection-sheet.component.html',
  styleUrls: ['./note-selection-sheet.component.scss'],
})
export class NoteSelectionSheetComponent implements OnInit {
  @Output() closeSheetEvent = new EventEmitter<any>()
  @Input() chapterReference
  @Input() chapterId
  private showCard = false
  passageReference = ''
  selectedData
  verses
  showHighlightColors = false
  selectedMarkerColor
  constructor(public storage: StorageService) {}

  ngOnInit() {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
   let card = document.getElementById('note-selection-card')
   //console.log(card)
   card.style.width = String(window.innerWidth - 20) + "px"
  }

  closeSheet(){
    this.showCard = false
    this.closeSheetEvent.emit()
  }

  hideHighlightColor(){
    if(this.selectedMarkerColor != undefined){
      let coloredText = Array.from(document.getElementsByClassName(this.selectedMarkerColor))
      coloredText.forEach((spans => {
        spans.classList.remove(this.selectedMarkerColor)
      }))
      this.selectedMarkerColor = undefined
    }
    this.showHighlightColors = false
  }

  async saveHighlightColor(){
    if(this.selectedMarkerColor != undefined){
      let storedData = await this.storage.getData('marked')
      for(let i=0;i<this.verses.length;i++){
        let data = {
          verse: this.chapterId +'.'+ this.verses[i],
          color: this.selectedMarkerColor
        }

        let searchedData = storedData.find(markedVerse => {
          //console.log(markedVerse.verse,data.verse)
          return markedVerse.verse == data.verse
        })
        console.log('search',searchedData)
        console.log('store',storedData)

        if(searchedData === undefined){
          console.log('new',data)
          await this.storage.addData('marked',data)
        } else {
          let newData = {
            id: searchedData.id,
            verse: this.chapterId +'.'+ this.verses[i],
            color: this.selectedMarkerColor
          }
          console.log('edit',newData)
          await this.storage.editItemByID('marked',newData)
        }


       // console.log(data)
      }
      this.selectedMarkerColor = false
      this.showHighlightColors = false
    }
  }

  openSheet(data){
    this.updatePassageReference(data)
    if(this.selectedMarkerColor != undefined)
      this.highlightText(this.selectedMarkerColor)
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
        this.selectedData.push(String(this.chapterId+"."+first +"-"+ this.chapterId+"."+verses[i]))
        //i = j
      } else {
        verseRanges.push(verses[i])
        this.selectedData.push(this.chapterId+"."+verses[i])
      }
    }
    if(lastNumberInRange !== verses[versesLength-1]){
      verseRanges.push(verses[versesLength-1])
      this.selectedData.push(this.chapterId+"."+verses[versesLength-1])
    }
    this.passageReference = this.chapterReference +":"+ verseRanges.toString()
    this.quiteUnseletedColorClass()
  }

  sortData(arr){
    arr.sort(function(a, b) {
      return a - b;
    });
  }

  highlightText(color: 'yellow'|'orange'|'red'|'green'|'blue'){
    this.selectedMarkerColor = color
    let selectedText = document.getElementsByClassName('selected-verse')
    //console.log(selectedText)
    for(let i=0;i<selectedText.length;i++){

      let availableColors = ['yellow','orange','red','green','blue']
      let hasAColor = false
      for(let j=0;j<availableColors.length;j++) {
       if(selectedText[i].classList.contains(availableColors[j])){
        console.log(selectedText[i].classList.replace(availableColors[j],color))
        hasAColor = true
        break
       }
      }

      if(!hasAColor){
        selectedText[i].classList.add(color)
      }
    }
  }

}
