import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
//import { SwiperOptions } from 'swiper';
import { NgxSpinnerService } from "ngx-spinner";
import { Swiper }  from 'swiper/types';
@Component({
  selector: 'app-select-passage-modal',
  templateUrl: './select-passage-modal.component.html',
  styleUrls: ['./select-passage-modal.component.scss'],
})
export class SelectPassageModalComponent {
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;
  @ViewChild('modal') modal: IonModal;
  @Input() bible
  @Output() passageSelectedEvent = new EventEmitter<any>()
  chapterList
  bookList
  selectedBook
  selectedChapter
  title = "Seleccione el libro"
  defaultTitle = "Seleccione el libro"
  showSpinner = false
  showSlides = true

  arrowDisable = [true,true]
  slides: Swiper;
  showFab = false
  constructor(public apiService: ApiService) { }

  ngOnChanges(e) {
    this.bible = e?.bible?.currentValue
    // console.log('ch: ', this.bible, e)
    // console.log({title:'testObj',data: this.bible, type: typeof this.bible});

    if (this.bible !== undefined)
      this.getBookList(this.bible?.id || this.bible)

  }

  swiperInit(){
    setTimeout(() => {
      this.slides = this.swiperRef?.nativeElement.swiper;
      console.log('swiperRef',this.slides);
      //this.showFab = true
    });

  }

  modalPresented() {
    console.log("presented");
    this.showFab = false
    this.showSlides = true
    //this.slides.lockSwipes(true)
    this.showSpinner = true
    this.chapterList = []
  }

  returnToPrev(){
    this.chapterList = []
    this.slides.slidePrev()
  }

  setBook(book) {
    this.showFab = true
    this.slides.slideNext()
    this.arrowDisable = [false,true]
    this.selectedBook = book
    this.getChapterList(this.bible.id, book.id)
  }

  setChapter(chapter) {
    this.selectedChapter = chapter
    this.resetValues()
    this.passageSelectedEvent.emit(chapter)
    this.showSlides = false
    setTimeout(()=>{
      this.showSlides = true
    })
    this.modal.dismiss()
  }

  getChapterList(bibleId, bookId) {
    let aux, data
    this.apiService.getChapterList(bibleId, bookId).subscribe((chapters) => {
      aux = chapters
      data = aux.data
      console.log('data',aux);

      this.chapterList = data[0].number === 'intro' ? data.slice(1) : data
      console.log(this.chapterList)
      this.title = this.selectedBook.name
      this.showSpinner = false
    })
  }

  getBookList(bibleId) {
    let data
    if (bibleId != undefined) {
      this.apiService.getBibleBookList(bibleId).subscribe((books) => {
        data = books
        this.bookList = data.data
        console.log(data);
      })
    }
  }

  resetValues() {
    this.showFab = false
    this.title = this.defaultTitle
    this.slides.slideTo(0)
    this.arrowDisable = [true,true]
  }

}
