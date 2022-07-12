import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-note-selection-sheet',
  templateUrl: './note-selection-sheet.component.html',
  styleUrls: ['./note-selection-sheet.component.scss'],
})
export class NoteSelectionSheetComponent implements OnInit {
  @Output() closeSheetEvent = new EventEmitter<any>()
  @Input() chapterReference
  private showCard = false
  passageReference = ''
  constructor() {

   }

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

  openSheet(data){
    this.updatePassageReference(data)
    this.showCard = true
  }

  getStatus(){
    return this.showCard
  }

  updatePassageReference(data){
    let verses = []
    data.forEach(verseInfo => {
      let id = verseInfo.verseId
      let index = id.lastIndexOf(".")+1
      verses.push(id.slice(index))
    })
    this.sortData(verses)
    let versesLength = verses.length
    let verseRanges = []
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
        //i = j
      } else {
        verseRanges.push(verses[i])
      }
    }
    if(lastNumberInRange !== verses[versesLength-1])
      verseRanges.push(verses[versesLength-1])

    let passageAux = this.chapterReference +":"
    verseRanges.forEach(range => {
      passageAux += range+","
    })
    this.passageReference = passageAux.slice(0, -1)
    //console.log(this.passageReference)
    //console.log(verses)
  }

  sortData(arr){
    arr.sort(function(a, b) {
      return a - b;
    });
  }

}
