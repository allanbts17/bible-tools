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
import { Utils, copy, log, lopy, removeByIndexList } from 'src/app/classes/utils';
import { SelectBibleModalComponent } from 'src/app/components/select-bible-modal/select-bible-modal.component';
import { NetworkService } from 'src/app/services/network.service';
import { Chapter, ChapterData } from 'src/app/interfaces/chapter';
import { forkJoin, lastValueFrom } from 'rxjs';
import { IonicSlides } from '@ionic/angular';
import { Swiper } from 'swiper/types';
import { ConfigService } from 'src/app/services/config.service';
import { App } from '@capacitor/app';
import { RequestService } from 'src/app/services/request.service';
import { OfflineRequestService } from 'src/app/services/offline-request.service';

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
  slideIndex = 1;

  initialChapter: ChapterData;
  lastChapter: ChapterData;

  //slideMoves = 0;
  slides: Swiper;
  swiperModules = [IonicSlides];
  //showSpace = false
  setScroll = true
  private utils: Utils = new Utils()
  //transitionIndex = this.slideIndex
  maxSlides = 21
  transitionStatus = false
  emptySlide = `<swiper-slide><ion-text class="block h-full scroll px-4 py-4 text-left"></ion-text>
  </swiper-slide>`
  blockTransitionAction = false
  fontSize: string
  networkStatus: boolean
  get ALLOW_BUTTON_SLIDE() { return this.conf.settings.options.allowButtonSliding }

  constructor(
    public apiService: ApiService,
    public storage: StorageService,
    public sharedInfo: SharedInfoService,
    protected network: NetworkService,
    protected conf: ConfigService,
    private req: RequestService,
    private offline: OfflineRequestService

  ) {
    this.fontSize = `${conf.interpolateFontSize(conf.settings.options.fontSize)}rem`
    this.conf.fontSizeChange$.subscribe(size => {
      this.fontSize = `${size}rem`
    })
    //this.getAvailablaBibles()
    this.loadMarkedVerses();

    // App.addListener('appStateChange', ({ isActive }) => {
    //   console.log('App state changed. Is active?', isActive);
    // });

    // App.addListener('pause', () => {
    //   console.log('App paused');
    // });

    // App.addListener('resume', () => {
    //   console.log('App resumed');
    // });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.slides = this.swiperRef?.nativeElement.swiper;
      // setInterval(() => {
      //   lopy("swiper interval", this.swiperRef?.nativeElement.swiper)
      // }, 500)
    });
  }

  ngOnInit() {
    for (let i = 0; i <= this.lastIndex; i++)
      this.showedChapters.push({
        content: '',
        bibleId: '',
        id: 'EMPTY',
      } as ChapterData);
    this.setDefaultData();
    this.storage.getStoredBibles().then(storedBibles => {
      this.offline.storedBibles = storedBibles
      console.log("storedBibles",this.offline.storedBibles)
    })
    setTimeout(() => {
      let obs$ = this.network.status$.subscribe(async (status) => {
        if (this.networkStatus !== status.connected && this.networkStatus !== undefined)
          setTimeout(async () => {
            console.log('to reload page');
            this.networkStatus = status.connected
            // this.slides = this.swiperRef?.nativeElement.swiper;
            // // lopy("debug", "network status", status)
            // // lopy("debug", "on network sus slides", this.slides)
            // // lopy("debug", "swiperRef", this.swiperRef)
            // this.showedChapters = []
            // this.showedChapters.push({
            //   content: '',
            //   bibleId: '',
            //   id: 'EMPTY',
            // } as ChapterData);
            // this.sharedInfo.once = false
            // await this.sharedInfo.init()
            // this.setDefaultData();

          });

        if (status.connected) {

          //this.setDefaultData();
          //obs$.unsubscribe()
        } else {
          //lopy("debug", "network off swiperRef", this.swiperRef)
        }
      });
    });
  }

  onActiveIndexChange() {
    if (this.start) {
      this.slideIndex = this.slides.activeIndex;
      // try {
      //   this.sharedInfo.chapter = copy(this.showedChapters[this.slideIndex])
      // } catch(err){
      //   console.log('set shared chapter error',err);

      // }

      // console.log('moves indexs',this.slideIndex);
    }


  }

  onTransitionStart(ev) {
    console.log('transition - Start', ev);
    this.transitionStatus = true
    let index = this.slideIndex
    setTimeout(() => {
      //console.log(index,this.slides.slides.length - 1,!this.transitionStatus);
      if (this.transitionStatus && (index == 0 || index == this.slides.slides.length - 1)) {
        let direction = index == 0 ? 'left' : 'right'
        //console.log('transition - Error, next slide not loaded',direction,index,this.showedChapters);
        this.sharedInfo.chapter = this.showedChapters[this.slideIndex];
        console.log('enter here', this.sharedInfo.chapter);
        this.utils.addToStack(async () => { this.updateText(direction) });
      }
    }, 300)
  }

  async onTransitionToPrev() {
    if (this.blockTransitionAction) {
      this.blockTransitionAction = false
      return
    }
    this.transitionEnd();
    if (this.slideIndex <= 1)
      this.utils.addToStack(async () => { await this.updateText('left') });
  }

  async onTransitionToNext() {
    console.log('trans end', this.blockTransitionAction);

    if (this.blockTransitionAction) {
      this.blockTransitionAction = false
      return
    }
    this.transitionEnd();
    if (this.slideIndex >= this.slides.slides.length - 2)
      this.utils.addToStack(async () => { this.updateText('right') });
  }

  private transitionEnd() {
    console.log('transition - end', this.transitionStatus);
    this.transitionStatus = false
    let actualShowChapter = this.showedChapters[this.slideIndex];
    let toStore = _.pick(actualShowChapter, 'bibleId', 'id');
    // Storing actual chapter
    if (toStore?.id !== '' && toStore?.id !== undefined)
      this.storeLastChapter({
        bibleId: toStore.bibleId,
        chapterId: toStore.id
      });

    if (actualShowChapter.id !== '')
      this.sharedInfo.chapter = actualShowChapter;

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

  removeEmptySlides() {
    setTimeout(() => {
      let indexList = []
      log('showed on remove', this.showedChapters)
      for (let i = 0; i < this.showedChapters.length; i++) {
        if (this.showedChapters[i].id == "EMPTY") {
          this.slides.removeSlide(i)
          indexList.push(i)
        }
      }
      removeByIndexList(this.showedChapters, indexList)
      this.initialChapter = this.showedChapters[0];
      this.lastChapter = this.showedChapters[this.showedChapters.length - 1];

      // if (this.showedChapters[0].id == 'GEN.1' && this.sharedInfo.chapter.id == 'GEN.1'){
      //   this.slides.removeSlide(0)
      // }

      //In case of Apoc
      if (this.showedChapters[this.showedChapters.length - 1].id == 'REV.22')
        this.slides.removeSlide(this.showedChapters.length)
      //lopy('hola', this.showedChapters, this.showedChapters[this.showedChapters.length - 1].id == 'REV.22');
    })
  }

  setAllSlides(bibleId: string, chapterId: string) {
    //this.slideIndex = 0
    ///debugger
    console.log("setting all slides")
    this.resetSlides()
    this.apiService.getChapter(bibleId, chapterId, true).subscribe(
      async (chapterContent: Chapter) => {
        let chapter = chapterContent.data;
        this.chapterToSlideDistribution(this.slideIndex, chapter);
        
        this.offline.retainConnection = true
        let promiseNext = this.setNextChapter(this.slideIndex, chapter); //.then(slide => console.log(slide)).catch(err => console.log(err))
        let promisePrev = this.setPrevChapter(this.slideIndex, chapter); //.then(slide => console.log(slide)).catch(err => console.log(err))
        await this.req.showLoading()
        await Promise.all([promisePrev, promiseNext]);
        //console.tag("Prueba","Tambien Llegué Aquí")
        this.offline.closeConnection()
        //console.tag("Prueba","Llegué Aquí")
        this.req.hideLoading()
        this.removeEmptySlides()

        this.start = true;
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

  resetSlides() {
    console.log('slidesssss', this.slides);
    //lopy("debug", "on resetSlides - slides", this.slides)
    if (!this.slides || this.slides?.destroyed) return
    this.showedChapters = []
    this.start = false
    this.transitionStatus = false
    this.slides.removeAllSlides()
    for (let i = 0; i <= this.lastIndex; i++) {
      this.showedChapters.push({
        content: '',
        bibleId: '',
        id: 'EMPTY',
      } as ChapterData);
      this.slides.appendSlide(this.emptySlide)
    }
    //lopy('test',this.slides.slides,this.showedChapters)
    this.blockTransitionAction = true

    this.slideIndex = 1
    this.slides.slideTo(1, 0)
    setTimeout(() => {
      this.blockTransitionAction = false
    }, 200)
  }

  async setNextChapter(slide, chapter) {
    slide += 1;
    if (chapter?.next != undefined && slide <= this.lastIndex) {
      let chapterContent: Chapter = (await this.apiService
        .getChapter(chapter.bibleId, chapter.next.id, false)
        .toPromise()) as Chapter;
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
        .getChapter(chapter.bibleId, chapter.previous.id, false)
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

  async fabClicked(next: boolean) {
    if (next) this.slides.slideNext();
    else this.slides.slidePrev();
  }

  async updateText(direction) {
    //const delay = ms => new Promise(res => setTimeout(res, ms));
    //await delay(3000)
    if (direction === 'right') {
      if (!this.lastChapter?.next)
        return
      let obs$ = this.apiService.getChapter(
        this.lastChapter.bibleId,
        this.lastChapter.next.id
      )
      let chapter: Chapter = await lastValueFrom(obs$)
      if (this.showedChapters.find(chap => chap.id == chapter.data.id))
        return
      this.slides.appendSlide(this.emptySlide)
      if (this.slides.slides.length == this.maxSlides) {
        this.slides.removeSlide(0)
        this.showedChapters.shift()
      }

      this.showedChapters.push(chapter.data)
      this.setSlideContent(this.slides.slides.length - 1, chapter.data)
      this.initialChapter = this.showedChapters[0];
      this.lastChapter = chapter.data;

    } else if (direction === 'left') {
      if (!this.initialChapter?.previous)
        return
      let obs$ = this.apiService.getChapter(
        this.initialChapter.bibleId,
        this.initialChapter.previous.id
      )
      let chapter: Chapter = await lastValueFrom(obs$)
      if (this.showedChapters.find(chap => chap.id == chapter.data.id))
        return
      if (this.slides.slides.length == this.maxSlides) {
        this.slides.removeSlide(this.slides.slides.length - 1)
        this.showedChapters.pop()
      }

      console.log('slide length: ', this.slides.slides.length - 1);
      this.slides.prependSlide(this.emptySlide)
      this.showedChapters.unshift(chapter.data)
      this.setSlideContent(0, chapter.data)
      this.initialChapter = chapter.data;
      this.lastChapter = this.showedChapters[this.showedChapters.length - 1];
    }
  }

  async loadMarkedVerses() {
    this.markersData = await this.storage.getData('marked');
    console.log('marked',this.markersData);
  }

  updateMarkedVerses(){
    
  }

  setSlideContent(index, data: ChapterData) {
    //console.log('dataa',data);

    setTimeout(() => {
      var slideNodeList = document.querySelectorAll(
        'swiper-container#bible-slides ion-text'
      );
      var slideArray = Array.from(slideNodeList);
      var slideElements = <HTMLIonTextElement[]>slideArray;
      this.removeAllChild(slideElements[index]);
      console.log('slide elements: ', slideElements);
      console.log('index', index);

      // Filling chapter content
      let spaceDIV = '<div class="w-full chapter-space"></div>'; //h-36 or h-0
      let spaceFab = this.ALLOW_BUTTON_SLIDE ? '<div class="fab-space"></div>' : '';
      let copyrightInfo = '<div class="copyright">' + data.copyright + '</div>'
      console.log('on set text', index, slideElements.length, copy(this.showedChapters));

      slideElements[index].insertAdjacentHTML(
        'beforeend',
        data.content + copyrightInfo + spaceFab + spaceDIV
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
    if (fab.length > 0) {
      fab[0].classList.remove('down');
      fab[1].classList.remove('down');
      fab[0].classList.add('lift');
      fab[1].classList.add('lift');
    }
  }

  closeSpace() {
    let space = document.getElementsByClassName('chapter-space');
    let fab = document.getElementsByClassName('study-fab');
    for (let i = 0; i < space.length; i++) {
      if (space[i].classList.contains('h-36'))
        space[i].classList.remove('h-36');
      if (fab.length > 0) {
        fab[0].classList.remove('lift');
        fab[1].classList.remove('lift');
        fab[0].classList.add('down');
        fab[1].classList.add('down');
      }
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
    //lopy('chapterT',chapter)
    let toStore = _.pick(chapter, 'bibleId', 'id');
    //lopy('chapterT',toStore,{ bibleId: toStore.bibleId, chapterId: toStore.id })

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
    //lopy("debug", "sharedInfo bible and chapter", this.sharedInfo.bible, this.sharedInfo.chapter)
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
