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

  ngOnChanges(e) {
    this.bible = e?.bible?.currentValue
    // console.log('ch: ', this.bible, e)
    // console.log({title:'testObj',data: this.bible, type: typeof this.bible});

    if (this.bible !== undefined)
      this.getBookList(this.bible?.id || this.bible)

  }

  modalPresented() {
    this.slides.lockSwipes(true)
    /* this.myOptions.allowTouchMove = false
     console.log(this.myOptions)
     this.slides.options = this.myOptions
     this.slides.update()*/
  }

  async transitionFinished() {
    let index = await this.slides.getActiveIndex()
    console.log(index)
    if (index == 0) {
      this.slides.lockSwipes(true)
    } else {
      this.slides.lockSwipes(false)
      this.slides.lockSwipeToNext(true)
      /*this.slides.lockSwipeToPrev(false)
      this.slides.lockSwipeToNext(true)*/
    }

  }

  setBook(book) {
    this.slides.lockSwipeToNext(false)
    this.slides.slideNext()
    this.selectedBook = book
    //console.log({bible: this.bible, book: book});

    this.getChapterList(this.bible.id, book.id)
  }

  setChapter(chapter) {
    this.selectedChapter = chapter
    this.resetValues()
    this.passageSelectedEvent.emit(chapter)
    this.modal.dismiss()
  }

  getChapterList(bibleId, bookId) {
    //console.log(bibleId,bookId);

    let aux, data
    this.apiService.getChapterList(bibleId, bookId).subscribe((chapters) => {
      aux = chapters
      data = aux.data
      console.log('data',aux);

      this.chapterList = data[0].number === 'intro' ? data.slice(1) : data
      //console.log(this.chapterList)
      this.title = this.selectedBook.name


    })
  }

  getBookList(bibleId) {

    let data
    if (bibleId != undefined) {
      this.apiService.getBibleBookList(bibleId).subscribe((books) => {
        data = books
        this.bookList = data.data
        //console.log(this.bookList)

      })
    }
  }

  resetValues() {
    this.title = this.defaultTitle
    this.slides.slideTo(0)
  }

}
