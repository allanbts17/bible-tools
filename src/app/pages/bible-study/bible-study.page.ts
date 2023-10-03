import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
//import { IonSlides } from '@ionic/angular';
//import { SwiperOptions } from 'swiper';
import { NoteSelectionSheetComponent } from 'src/app/components/note-selection-sheet/note-selection-sheet.component';
import { StorageService } from 'src/app/services/storage.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { SelectPassageModalComponent } from 'src/app/components/select-passage-modal/select-passage-modal.component';
import _ from 'underscore';
import { copy } from 'src/app/classes/utils';
import { SelectBibleModalComponent } from 'src/app/components/select-bible-modal/select-bible-modal.component';
import { NetworkService } from 'src/app/services/network.service';
import { Chapter, ChapterData } from 'src/app/interfaces/chapter';
import { forkJoin } from 'rxjs';
import { IonicSlides } from '@ionic/angular';
import { Swiper } from 'swiper/types';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BibleStudyPage implements OnInit {
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;
  @ViewChild('sheet') noteSelectionSheet: NoteSelectionSheetComponent;
  @ViewChild(SelectPassageModalComponent)
  selectPassage: SelectPassageModalComponent;
  @ViewChild(SelectBibleModalComponent) selectBible: SelectBibleModalComponent;
  availableBibleLanguages = [
    { id: 'spa', name: 'Español' },
    { id: 'eng', name: 'English' },
  ];
  bibles = [];
  //selectedBible
  bibleText;
  passageText = 'Génesis 1';
  //selectedChapter
  showedChapters: ChapterData[] = [];
  activeChapter;

  swipeLeftLock = false;
  swipeRightLock = true;
  start = false;
  selectedVerseArray = [];
  markersData = [];

  firstIndex = 0;
  lastIndex = 4;
  slideIndex = 2;

  initialChapter: ChapterData;
  lastChapter: ChapterData;

  slideMoves = 0;
  slides: Swiper;
  swiperModules = [IonicSlides];
  //showSpace = false
  setScroll = true

  constructor(
    public apiService: ApiService,
    public storage: StorageService,
    public sharedInfo: SharedInfoService,
    protected network: NetworkService
  ) {
    //this.getAvailablaBibles()
    this.loadMarkedVerses();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.slides = this.swiperRef?.nativeElement.swiper;
    });
  }

  onActiveIndexChange() {
    this.slideIndex = this.slides.activeIndex;
  }

  async onTransitionToPrev() {
   // this.transitionEnd();
    //await this.unlockSwipe('left')
    // this.updateText(
    //   this.showedChapters[this.slideIndex],
    //   'left',
    //   this.slideIndex
    // );
  }

  async onTransitionToNext() {
   // this.transitionEnd();
    //await this.unlockSwipe('left')
    // this.updateText(
    //   this.showedChapters[this.slideIndex],
    //   'left',
    //   this.slideIndex
    // );
  }

  private transitionEnd() {
    let actualShowChapter = this.showedChapters[this.slideIndex];
    let toStore = _.pick(actualShowChapter, 'bibleId', 'id');
    // Storing actual chapter
    if (toStore?.id !== '' && toStore?.id !== undefined)
      this.storeLastChapter({
        bibleId: toStore.bibleId,
        chapterId: toStore.id,
      });

    if (actualShowChapter.id !== '')
      this.sharedInfo.chapter = actualShowChapter;

    // Locking swipes
    if (!actualShowChapter?.next) {
      this.slides.allowSlideNext = false;
    } else if (!actualShowChapter?.previous) {
      this.slides.allowSlideNext = false;
    }

    this.noteSelectionSheet.closeSheet();
    this.closeSpace();

    setTimeout(() => {
      console.log(
        'showed cahpterrrrs',
        this.slideIndex,
        this.showedChapters,
        actualShowChapter
      );
    }, 2000);
  }

  ngOnInit() {
    this.start = true;

    for (let i = 0; i <= this.lastIndex; i++)
      this.showedChapters.push({
        content: 'holaaaa mundo',
        bibleId: '',
        id: '',
      } as ChapterData);

    setTimeout(() => {
      if (this.network.status.connected) {
        this.setDefaultData();
      } else {
        let obs$ = this.network.status$.subscribe(async (status) => {
          if (status.connected) {
            this.setDefaultData();
             obs$.unsubscribe()
          }
        });
      }
    });
    setTimeout(async () => {
      // console.log('actual index',await this.slides.getActiveIndex());
    });
  }



  // setChapter(bibleId: string, chapterId: string) {
  //   console.log('not first time');
  //   this.apiService.getChapter(bibleId, chapterId).subscribe(
  //     async (chapterContent: Chapter) => {
  //       let chapter = chapterContent.data;
  //       //console.log(chapter)
  //       this.chapterToSlideDistribution(this.slideIndex, chapter, 'actual');

  //       if (chapter?.next != undefined) {
  //         this.apiService
  //           .getChapter(chapter.bibleId, chapter.next.id)
  //           .subscribe((chapterContent: Chapter) => {
  //             this.chapterToSlideDistribution(
  //               this.slideIndex,
  //               chapterContent.data,
  //               'next'
  //             );
  //             if (this.swipeRightLock) this.slides.lockSwipeToNext(false);
  //           });
  //       } else {
  //         await this.slides.lockSwipeToNext(true);
  //         this.swipeRightLock = true;
  //       }

  //       if (
  //         chapter?.previous != undefined &&
  //         chapter?.previous.number != 'intro'
  //       ) {
  //         this.apiService
  //           .getChapter(chapter.bibleId, chapter.previous.id)
  //           .subscribe((chapterContent: Chapter) => {
  //             this.chapterToSlideDistribution(
  //               this.slideIndex,
  //               chapterContent.data,
  //               'previous'
  //             );
  //             if (this.swipeLeftLock) this.slides.lockSwipeToPrev(false);
  //           });
  //       } else {
  //         await this.slides.lockSwipeToPrev(true);
  //         this.swipeLeftLock = true;
  //       }
  //     },
  //     (error) => {
  //       if (error.error.statusCode === 404) {
  //         this.getBibleFirstChapter();
  //       } else {
  //         console.log(error);
  //       }
  //     }
  //   );
  // }

  setAllSlides(bibleId: string, chapterId: string) {
    this.apiService.getChapter(bibleId, chapterId).subscribe(
      async (chapterContent: Chapter) => {
        let chapter = chapterContent.data;
        this.chapterToSlideDistribution(this.slideIndex, chapter);
        let promiseNext = this.setNextChapter(this.slideIndex, chapter); //.then(slide => console.log(slide)).catch(err => console.log(err))
        let promisePrev = this.setPrevChapter(this.slideIndex, chapter); //.then(slide => console.log(slide)).catch(err => console.log(err))
        await Promise.all([promisePrev, promiseNext]);
        this.initialChapter = this.showedChapters[0];
        this.lastChapter = this.showedChapters[this.showedChapters.length - 1];
        console.log(
          'initial and last chapters',
          this.initialChapter,
          this.lastChapter
        );

        setTimeout(() => {
          console.log('showed chapters: ', this.showedChapters, this.slideIndex);
        }, 1000);
      },
      (error) => {
        if (error.error.statusCode === 404) {
          this.getBibleFirstChapter();
        } else {
          console.log(error);
        }
      }
    );
  }

  async setNextChapter(slide, chapter) {
    slide += 1;
    if (chapter?.next != undefined && slide <= this.lastIndex) {
      let chapterContent: Chapter = (await this.apiService
        .getChapter(chapter.bibleId, chapter.next.id)
        .toPromise()) as Chapter;
      //console.log('next chaptCont',chapterContent.data);

      this.chapterToSlideDistribution(slide, chapterContent.data, false);
      //if (this.swipeRightLock) await this.slides.lockSwipeToNext(false);

      await this.setNextChapter(slide, chapterContent.data);

    } else {
      // console.log('lock next');
      // await this.slides.lockSwipeToNext(true)
      // this.swipeRightLock = true
    }
    return slide;
  }

  async setPrevChapter(slide, chapter) {
    slide -= 1;

    if (chapter?.previous != undefined && slide >= this.firstIndex) {
      let chapterContent: Chapter = (await this.apiService
        .getChapter(chapter.bibleId, chapter.previous.id)
        .toPromise()) as Chapter;
      this.chapterToSlideDistribution(slide, chapterContent.data, false);
      //if (this.swipeLeftLock) this.slides.lockSwipeToPrev(false);
      //console.log('slide: ', slide, 'firstIndex: ', this.firstIndex, 'prev chaptCont: ', chapterContent.data);

      await this.setPrevChapter(slide, chapterContent.data);
    } else {

    }
    return slide;
  }

  setChapterFirstTime(bibleId, chapterId) {
    console.log('first time');
    this.apiService.getChapter(bibleId, chapterId).subscribe(
      (chapterContent: Chapter) => {
        //console.log(chapterContent)
        this.bibleText = chapterContent.data;
        this.sharedInfo.chapter = chapterContent.data;
        //this.setSelectedChapterInfo(this.bibleText)
        this.chapterToSlideDistribution(
          this.slideIndex,
          this.bibleText,
        );
        this.apiService
          .getChapter(this.bibleText.bibleId, this.bibleText.next.id)
          .subscribe((chapterContent: Chapter) => {
            this.chapterToSlideDistribution(
              this.slideIndex,
              chapterContent.data);
            if (this.swipeRightLock) this.slides.allowSlideNext = true;
          });
      },
      (error) => {
        if (error.error.statusCode === 404) {
          this.getBibleFirstChapter();
        } else {
          console.log(error);
        }
      }
    );
  }

  // /**
  //  * When index changes have 1,2 difference is 1
  //  * when changes have 1,3 diference is 2
  //  * @param index
  //  * @returns {'right' | 'left' | 'stay'} Direction
  //  */
  // swipeDirection(index): 'right' | 'left' | 'stay' {
  //   var diff = index - this.slideIndex;
  //   if (diff === 1 || diff < -1) {
  //     return 'right';
  //   } else if (diff === -1 || diff > 1) {
  //     return 'left';
  //   } else {
  //     return 'stay';
  //   }
  // }

  // async unlockSwipe(direction: 'right' | 'left' | 'stay') {
  //   if (direction === 'right') {
  //     if (this.swipeLeftLock) {
  //       await this.slides.lockSwipeToPrev(false);
  //       this.swipeLeftLock = false;
  //     }
  //   } else {
  //     if (this.swipeRightLock) {
  //       await this.slides.lockSwipeToNext(false);
  //       this.swipeRightLock = false;
  //     }
  //   }
  // }

  // async getActiveIndex() {
  //   let index = await this.slides.getActiveIndex();
  //   index = index === this.lastAuxIndex ? this.firstIndex : index;
  //   index = index === this.firstAuxIndex ? this.lastIndex : index;
  //   return index;
  // }

  async fabClicked(next: boolean) {
    if (next) this.slides.slideNext();
    else this.slides.slidePrev();
  }

  /*TODO: Bug if swipe is too fast
   * If I swipe many times too fast, it returns to the loop's start
   * too soon, before data updates
   */
  // async transitionFinished(): Promise<void> {
  //   if (this.start) {
  //     let index = await this.getActiveIndex();
  //     let direction = this.swipeDirection(index);
  //     let actualShowChapter = this.showedChapters[index - 1];
  //     let toStore = _.pick(actualShowChapter, 'bibleId', 'id');

  //     // Storing actual chapter
  //     if (toStore?.id !== '' && toStore?.id !== undefined)
  //       this.storeLastChapter({
  //         bibleId: toStore.bibleId,
  //         chapterId: toStore.id,
  //       });
  //     if (actualShowChapter.id !== '')
  //       this.sharedInfo.chapter = actualShowChapter;
  //     console.log('ind: ', index); //'prev: ',this.slideIndex)
  //     this.slideIndex = index;
  //     if (direction !== 'stay') {
  //       this.noteSelectionSheet.closeSheet();
  //       this.closeSpace();
  //       this.slideMoves = this.slideMoves + (direction == 'right' ? 1 : -1);
  //       setTimeout(async () => {
  //         await this.unlockSwipe(direction);
  //         this.updateText(this.showedChapters[index - 1], direction, index);
  //       });
  //     }
  //     if (!actualShowChapter?.next) {
  //       await this.slides.lockSwipeToNext(true);
  //     } else if (!actualShowChapter?.previous) {
  //       console.log('hii locck');
  //       await this.slides.lockSwipeToPrev(true);
  //     }
  //     setTimeout(() => {
  //       console.log(
  //         'showed cahpterrrrs',
  //         this.slideIndex,
  //         this.showedChapters,
  //         actualShowChapter
  //       );
  //     }, 2000);
  //   }
  // }

  async updateText(textData, direction, index) {
    this.activeChapter = textData;
    let changeSlideDiff = (this.lastIndex + 1) / 2;

    if (direction === 'right') {
      this.apiService.getChapter(
        this.lastChapter.bibleId,
        this.lastChapter.next.id
      ).subscribe((chapter: Chapter)=>{
        this.setSlideContent(this.lastIndex,chapter.data)

        this.slides.appendSlide(`<ion-text class="h-full overflow-y-scroll px-4 py-4 text-left"></ion-text>`)
        this.showedChapters.shift()
        this.setSlideContent(this.lastIndex,chapter.data)
        this.initialChapter = this.showedChapters[0];
        this.lastChapter = chapter.data; ;
      });
      return;
      // await this.slides.lockSwipeToNext(true);
      // if (!this.lastChapter?.next) {
      //   this.showedChapters[this.loopPrev(index, changeSlideDiff) - 1].id = '';
      //   return;
      // }
      // let lastChapter$ = this.apiService.getChapter(
      //   this.lastChapter.bibleId,
      //   this.lastChapter.next.id
      // );
      // let firstChapter$ = this.apiService.getChapter(
      //   this.initialChapter.bibleId,
      //   this.initialChapter.next.id
      // );
      // const result = forkJoin([lastChapter$, firstChapter$]);
      // result.subscribe(async (chapters: [Chapter, Chapter]) => {
      //   await this.slides.lockSwipeToNext(false);
      //   let chapterContent = chapters[0];
      //   this.showedChapters[this.loopPrev(index, changeSlideDiff) - 1] =
      //     chapterContent.data;
      //   this.setSlideContent(
      //     this.loopPrev(index, changeSlideDiff),
      //     chapterContent.data
      //   );
      //   if (index == this.lastIndex) {
      //     this.setSlideContent(this.lastAuxIndex, this.showedChapters[0]);
      //     this.setSlideContent(
      //       this.firstAuxIndex,
      //       this.showedChapters[this.showedChapters.length - 1]
      //     );
      //   }
      //   this.lastChapter = chapterContent.data;
      //   this.initialChapter = chapters[1].data;
      //   // if (this.swipeRightLock) this.slides.lockSwipeToNext(false)
      // });
    } else if (direction === 'left') {
      this.apiService.getChapter(
        this.initialChapter.bibleId,
        this.initialChapter.previous.id
      ).subscribe((chapter: Chapter)=>{
        
        this.slides.prependSlide(`<ion-text class="h-full overflow-y-scroll px-4 py-4 text-left"></ion-text>`)
        this.showedChapters.pop()
        this.setSlideContent(this.firstIndex,chapter.data)
        this.initialChapter = chapter.data;
        this.lastChapter = this.showedChapters[this.showedChapters.length-1];
      });
      return;
      // await this.slides.lockSwipeToPrev(true);
      // if (!this.initialChapter?.previous) {
      //   this.showedChapters[this.loopNext(index, changeSlideDiff) - 1].id = '';
      //   return;
      // }
      // let lastChapter$ = this.apiService.getChapter(
      //   this.lastChapter.bibleId,
      //   this.lastChapter.previous.id
      // );
      // let firstChapter$ = this.apiService.getChapter(
      //   this.initialChapter.bibleId,
      //   this.initialChapter.previous.id
      // );
      // const result = forkJoin([lastChapter$, firstChapter$]);
      // result.subscribe(async (chapters: [Chapter, Chapter]) => {
      //   await this.slides.lockSwipeToPrev(false);
      //   let chapterContent = chapters[1];
      //   this.showedChapters[this.loopNext(index, changeSlideDiff) - 1] =
      //     chapterContent.data;
      //   this.setSlideContent(
      //     this.loopNext(index, changeSlideDiff),
      //     chapterContent.data
      //   );
      //   if (index == this.firstIndex) {
      //     this.setSlideContent(this.lastAuxIndex, this.showedChapters[0]);
      //     this.setSlideContent(
      //       this.firstAuxIndex,
      //       this.showedChapters[this.showedChapters.length - 1]
      //     );
      //   }
      //   this.initialChapter = chapterContent.data;
      //   this.lastChapter = chapters[0].data;
      //   // if (this.swipeLeftLock) this.slides.lockSwipeToPrev(false)
      // });
    }
  }

  async loadMarkedVerses() {
    this.markersData = await this.storage.getData('marked');
    console.log(this.markersData);
  }

  setSlideContent(index, data) {
    //console.log('dataa',data);

    setTimeout(() => {
      var slideNodeList = document.querySelectorAll(
        'swiper-container#bible-slides ion-text'
      );
      var slideArray = Array.from(slideNodeList);
      var slideElements = <HTMLIonTextElement[]>slideArray;
      this.removeAllChild(slideElements[index]);
        console.log('slide elements: ',slideElements);
        console.log('index',index);
        
      // Filling chapter content
      let spaceDIV = '<div class="w-full chapter-space"></div>'; //h-36 or h-0
      let spaceFab = '<div class="fab-space"></div>';
      slideElements[index].insertAdjacentHTML(
        'beforeend',
        data.content + spaceFab + spaceDIV
      );

      // Color markers
      var spanArray = Array.from(document.querySelectorAll('span.verse-span'));
      var spanElementArray = <HTMLParagraphElement[]>spanArray;
      spanElementArray.forEach((span) => {
        let dataVerseId = span.getAttribute('data-verse-id');
        let markedVerse = this.markersData.find(
          (marked) => marked.verse == dataVerseId
        );
        /** Setting mark if have mark */
        if (markedVerse !== undefined) {
          const verseSegments = Array.from(
            document.querySelectorAll(
              '[data-verse-id="' + `${dataVerseId}` + '"]'
            )
          );
          verseSegments.forEach((verse) => {
            verse.classList.add(markedVerse.color);
          });
          //var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
        }

        span.addEventListener('click', (clickEvent: MouseEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          clickEvent.stopImmediatePropagation();

          let verseId = span.getAttribute('data-verse-id');
          const verseSegments = Array.from(
            document.querySelectorAll('[data-verse-id="' + `${verseId}` + '"]')
          );
          var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments;

          if (
            !this.selectedVerseArray.some((verse) => verse.verseId == verseId)
          ) {
            verseSegmentsElementArray.forEach((verseSpan) => {
              verseSpan.classList.add('selected-verse');
            });
            this.selectedVerseArray.push({
              verseId: verseId,
              bibleId: this.sharedInfo.bible.id,
            });

            this.noteSelectionSheet.openSheet(this.selectedVerseArray);
            this.openSpace();
          } else {
            verseSegmentsElementArray.forEach((verseSpan) => {
              verseSpan.classList.remove('selected-verse');
            });
            let index = this.selectedVerseArray.findIndex(
              (verse) => verse.verseId == verseId
            );
            this.selectedVerseArray = this.arrayRemove(
              this.selectedVerseArray,
              this.selectedVerseArray[index]
            );

            if (this.selectedVerseArray.length == 0) {
              this.noteSelectionSheet.closeSheet();
              this.closeSpace();
            } else {
              this.noteSelectionSheet.updatePassageReference(
                this.selectedVerseArray
              );
            }
          }
        });
      });
    });
  }

  openSpace() {
    console.log('enter here');

    let space = document.getElementsByClassName('chapter-space');
    let fab = document.getElementsByClassName('study-fab');
    for (let i = 0; i < space.length; i++) {
      if (!space[i].classList.contains('h-36')) space[i].classList.add('h-36');
    }

    fab[0].classList.remove('down');
    fab[1].classList.remove('down');

    fab[0].classList.add('lift');
    fab[1].classList.add('lift');

    console.log(fab[0].classList);
  }

  closeSpace() {
    let space = document.getElementsByClassName('chapter-space');
    let fab = document.getElementsByClassName('study-fab');
    for (let i = 0; i < space.length; i++) {
      if (space[i].classList.contains('h-36'))
        space[i].classList.remove('h-36');

      fab[0].classList.remove('lift');
      fab[1].classList.remove('lift');

      fab[0].classList.add('down');
      fab[1].classList.add('down');
    }
  }

  unselectAll() {
    if (this.selectedVerseArray.length != 0) {
      const verseSegments = Array.from(
        document.getElementsByClassName('selected-verse')
      );
      var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments;
      verseSegmentsElementArray.forEach((verseSpan) => {
        verseSpan.classList.remove('selected-verse');
      });
      this.selectedVerseArray.length = 0;
    }
    this.closeSpace();
  }

  arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele != value;
    });
  }

  closeSelectionSheet() {
    this.unselectAll();
  }

  chapterToSlideDistribution(index, data, setActiveChapter = true) {
    this.showedChapters[index] = data;
    this.setSlideContent(index, data);
    if (setActiveChapter) this.activeChapter = data;
  }

  /*TODO: Updatating chapter issue
   * If I am in a spanish bible on Genesis, and I change to an English(or maybe Spanish?)
   * bible with only New Testament, I can't see Mattew until I touch and move the slide,
   * seems like the duplicate slide is not updated well, but its not the duplicated slide.
   * Allan Bennett. July 10, 2022
   */
  bibleChange(bible) {
    //this.selectedBible = bible
    this.noteSelectionSheet.closeSheet();
    this.closeSpace();
    console.log('on bible change', bible.id, this.sharedInfo.chapter?.id);
    this.storeLastChapter({
      bibleId: bible.id,
      chapterId: this.sharedInfo.chapter?.id || 'GEN.1',
    });
    //this.setChapter(bible.id, this.sharedInfo.chapter?.id || 'GEN.1')

    this.setAllSlides(bible.id, this.sharedInfo.chapter?.id || 'GEN.1');
  }

  chapterChange(chapter) {
    this.sharedInfo.chapter = chapter;

    let toStore = _.pick(chapter, 'bibleId', 'id');
    this.storeLastChapter({ bibleId: toStore.bibleId, chapterId: toStore.id });

    this.noteSelectionSheet.closeSheet();
    this.closeSpace();

    this.slideIndex = this.lastIndex / 2;
    this.setAllSlides(chapter.bibleId, chapter.id);
  }

  storeLastChapter(chapter: { bibleId: string; chapterId: string }) {
    console.log('toStore', chapter);
    this.storage.setLastChapter(chapter);
  }

  getBibleFirstChapter() {
    var auxCh;
    this.apiService.getBibleFirstChapter(this.sharedInfo.bible.id).then(
      async (chapter) => {
        auxCh = chapter;
        //console.log('change',chapter);

        //this.selectedChapter = chapter
        this.sharedInfo.chapter = chapter;
        this.start = true;
        //var ind = await this.slides.getActiveIndex()
        //console.log('first ind: ',ind)
        
        //await this.slides.lockSwipeToPrev(true);
        this.swipeLeftLock = true;
        this.setChapterFirstTime(this.sharedInfo.bible.id, auxCh.id);
      },
      (err) => console.log(err)
    );
  }

  async setDefaultData() {
    //this.swipeLeftLock = true;
    this.setAllSlides(this.sharedInfo.bible.id, this.sharedInfo.chapter.id);

  }

  getAllLang() {
    var aux;
    this.apiService.getAllLanguages().then(
      (languages) => {
        aux = languages;
        aux.forEach((language) => {
          console.log(language.id, language.name, language.nameLocal);
        });
      },
      (err) => console.error(err)
    );
  }

  removeAllChild(myNode) {
    while (myNode?.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }
  }
}
