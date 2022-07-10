import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal, IonSlides } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-select-passage-modal',
  templateUrl: './select-passage-modal.component.html',
  styleUrls: ['./select-passage-modal.component.scss'],
})
export class SelectPassageModalComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @ViewChild('slide') slides: IonSlides;
  @Input() bible
  @Output() passageSelectedEvent = new EventEmitter<any>()
  chapterList
  bookList
  selectedBook
  selectedChapter
  title = "Seleccione el libro"
  defaultTitle = "Seleccione el libro"

  myOptions: SwiperOptions = {
    //allowTouchMove: false
};

  constructor(public apiService: ApiService) { }

  ngOnInit() {
    //console.log(this.bible)
  }

  ngOnChanges(e){
    this.bible = e?.bible?.currentValue
    //console.log('ch: ',this.bible)
    this.getBookList(this.bible?.id)
  }

  modalPresented(){
    this.slides.lockSwipes(true)
   /* this.myOptions.allowTouchMove = false
    console.log(this.myOptions)
    this.slides.options = this.myOptions
    this.slides.update()*/
  }

  async transitionFinished(){
    let index = await this.slides.getActiveIndex()
    console.log(index)
    if(index == 0){
      this.slides.lockSwipes(true)
    } else {
      this.slides.lockSwipes(false)
      this.slides.lockSwipeToNext(true)
      /*this.slides.lockSwipeToPrev(false)
      this.slides.lockSwipeToNext(true)*/
    }

  }

  setBook(book){
    this.slides.lockSwipeToNext(false)
    this.slides.slideNext()
    this.selectedBook = book
    this.getChapterList(this.bible?.id,book.id)
  }

  setChapter(chapter){
    this.selectedChapter = chapter
    this.resetValues()
    this.passageSelectedEvent.emit(chapter)
    this.modal.dismiss()
  }

  getChapterList(bibleId,chapterId){
    let data
    this.apiService.getChapterList(bibleId,chapterId).subscribe((chapters)=>{
      data = chapters
      this.chapterList = data.data.slice(1)
      //console.log(this.chapterList)
      this.title = this.selectedBook.name


    })
  }

  getBookList(bibleId){

    let data
    if(bibleId != undefined){
      this.apiService.getBibleBookList(bibleId).subscribe((books)=>{
        data = books
        this.bookList = data.data
        //console.log(this.bookList)

      })
    }
  }

  resetValues(){
    this.title = this.defaultTitle
    this.slides.slideTo(0)
  }

}
