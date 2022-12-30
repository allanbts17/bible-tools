import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IonSlides } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { NoteSelectionSheetComponent } from 'src/app/components/note-selection-sheet/note-selection-sheet.component';
import { StorageService } from 'src/app/services/storage.service';
import { SharedInfoService } from 'src/app/services/shared-info.service';
import { SelectPassageModalComponent } from 'src/app/components/select-passage-modal/select-passage-modal.component';
import _ from 'underscore'
import { copy } from 'src/app/classes/utils';
import { SelectBibleModalComponent } from 'src/app/components/select-bible-modal/select-bible-modal.component';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BibleStudyPage implements OnInit {
  @ViewChild('slide') slides: IonSlides;
  @ViewChild('sheet') noteSelectionSheet: NoteSelectionSheetComponent;
  @ViewChild(SelectPassageModalComponent) selectPassage: SelectPassageModalComponent;
  @ViewChild(SelectBibleModalComponent) selectBible: SelectBibleModalComponent;
  availableBibleLanguages = [{ id: "spa", name: "Español" }, { id: "eng", name: "English" }]
  bibles = []
  //selectedBible
  bibleText
  passageText = "Génesis 1"
  //selectedChapter
  showedChapters = [
    { content: "", bibleId: "", id: "" },
    { content: "", bibleId: "", id: "" },
    { content: "", bibleId: "", id: "" }
  ]
  activeChapter
  myOptions: SwiperOptions = {
    loop: true,
  }
  swipeLeftLock = false
  swipeRightLock = true
  slideIndex = 1
  start = false
  selectedVerseArray = []
  markersData = []
  //showSpace = false

  constructor(public apiService: ApiService,
    public storage: StorageService,
    public sharedInfo: SharedInfoService) {
    //this.getAvailablaBibles()
    this.loadMarkedVerses()
  }

  ngOnInit() {
    this.start = true
    setTimeout(()=>
    this.setDefaultData())

  }

  setSelectedChapterInfo(data) {
    // this.selectedChapter = {
    //   id: data.id,
    //   number: data.number,
    //   reference: data.reference,
    //   bookId: data.bookId
    // }
    // this.sharedInfo.defaultChapter = this.selectedChapter
  }
  /**
   * if(index === 1){
            document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = this.showedChapters[2].content
          }
   */
  setChapter(bibleId, chapterId) {
    var aux, chapter

    this.apiService.getChapter(bibleId, chapterId).subscribe(async (chapterContent) => {
      aux = chapterContent
      chapter = aux.data
      //console.log(chapter)
      this.chapterToSlideDistribution(this.slideIndex, chapter, 'actual')

      if (chapter?.next != undefined) {
        this.apiService.getChapter(chapter.bibleId, chapter.next.id).subscribe((chapterContent) => {
          aux = chapterContent
          this.chapterToSlideDistribution(this.slideIndex, aux.data, 'next')
          if (this.swipeRightLock) this.slides.lockSwipeToNext(false)
        })
      } else {
        await this.slides.lockSwipeToNext(true)
        this.swipeRightLock = true
      }

      if (chapter?.previous != undefined && chapter?.previous.number != 'intro') {
        this.apiService.getChapter(chapter.bibleId, chapter.previous.id).subscribe((chapterContent) => {
          aux = chapterContent
          this.chapterToSlideDistribution(this.slideIndex, aux.data, 'previous')
          if (this.swipeLeftLock) this.slides.lockSwipeToPrev(false)
        })
      } else {
        await this.slides.lockSwipeToPrev(true)
        this.swipeLeftLock = true
      }

    }, error => {
      if (error.error.statusCode === 404) {
        this.getBibleFirstChapter()
      } else {
        console.log(error)
      }
    })
  }
  setChapterFirstTime(bibleId, chapterId) {
    var aux
    this.apiService.getChapter(bibleId, chapterId).subscribe((chapterContent) => {
      console.log(chapterContent)
      aux = chapterContent

      //this.apiService.getChapterInVerses(bibleId,chapterId)
      //console.log('changet',aux.data);

      this.bibleText = aux.data
      this.sharedInfo.chapter = aux.data
      this.setSelectedChapterInfo(this.bibleText)
      this.chapterToSlideDistribution(this.slideIndex, this.bibleText, 'actual')
      this.apiService.getChapter(this.bibleText.bibleId, this.bibleText.next.id).subscribe((chapterContent) => {
        aux = chapterContent
        this.chapterToSlideDistribution(this.slideIndex, aux.data, 'next')
        if (this.swipeRightLock) this.slides.lockSwipeToNext(false)
      })
    }, error => {

      if (error.error.statusCode === 404) {
        this.getBibleFirstChapter()
      } else {
        console.log(error)
      }
    })
  }


 /**
  * When index changes have 1,2 difference is 1
  * when changes have 1,3 diference is 2
  * @param index
  * @returns {'right' | 'left' | 'stay'} Direction
  */
  swipeDirection(index): 'right' | 'left' | 'stay' {
    var diff = index - this.slideIndex
    if (diff === 1 || diff === -2) {
      return 'right'
    } else if (diff === -1 || diff === 2) {
      return 'left'
    } else {
      return 'stay'
    }
  }

  async unlockSwipe(direction: 'right' | 'left') {
    if (direction === 'right') {
      if (this.swipeLeftLock) {
        await this.slides.lockSwipeToPrev(false)
        this.swipeLeftLock = false
      }
    } else {
      if (this.swipeRightLock) {
        await this.slides.lockSwipeToNext(false)
        this.swipeRightLock = false
      }
    }
  }

  async getActiveIndex() {
    let index = await this.slides.getActiveIndex()
    index = index === 4 ? 1 : index
    index = index === 0 ? 3 : index
    return index
  }

  /*TODO: Bug if swipe is too fast
   * If I swipe many times too fast, it returns to the loop's start
   * too soon, before data updates
   */
  async transitionFinished(): Promise<void> {
    //console.log(this.start)
    if (this.start) {

      let index = await this.getActiveIndex()
      let direction = this.swipeDirection(index)
      //console.log('preTran', this.showedChapters[index - 1]);
      let actualShowChapter = this.showedChapters[index - 1]
      let toStore = _.pick(actualShowChapter, 'bibleId', 'id')
      if (toStore?.id !== '' && toStore?.id !== undefined)
        this.storeLastChapter({ bibleId: toStore.bibleId, chapterId: toStore.id })
      this.setSelectedChapterInfo(actualShowChapter)

      if (actualShowChapter.id !== '')
        this.sharedInfo.chapter = actualShowChapter
      console.log('ind: ', index)//'prev: ',this.slideIndex)
      this.slideIndex = index

      //var dup = document.getElementsByClassName('swiper-slide-duplicate')
      //console.log(dup)
      if (direction !== 'stay') {
        this.noteSelectionSheet.closeSheet()
        this.closeSpace()
        this.unlockSwipe(direction)
        this.updateText(this.showedChapters[index - 1], direction, index)
      }

    }
  }

  async updateText(textData, direction, index) {
    //console.log(index)
    //let lastIndex = await this.slides.getPreviousIndex()
    //this.chapterToSlideDistribution(index,textData,'actual')
    var data

    if (direction === 'right') {
      if (index === 1) {
        //document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = this.showedChapters[2].content
        this.setSlideContent(0, this.showedChapters[2])
      }
      if (textData?.next != undefined) {
        this.apiService.getChapter(textData.bibleId, textData.next.id).subscribe((chapterContent) => {
          data = chapterContent
          this.chapterToSlideDistribution(index, data.data, 'next')
          if (this.swipeRightLock) this.slides.lockSwipeToNext(false)
        })
      } else {
        this.slides.lockSwipeToNext(true)
        this.swipeRightLock = true
      }
    } else {
      if (index === 3) {
        //console.log('entered',document.getElementsByClassName('swiper-slide-duplicate'))
        //document.getElementsByClassName('swiper-slide-prev')[0].children[0].innerHTML = this.showedChapters[0].content
        this.setSlideContent(4, this.showedChapters[0])
      }
      if (textData?.previous != undefined && textData?.previous.number != 'intro') {
        this.apiService.getChapter(textData.bibleId, textData.previous.id).subscribe((chapterContent) => {
          data = chapterContent
          this.chapterToSlideDistribution(index, data.data, 'previous')
          if (this.swipeLeftLock) this.slides.lockSwipeToPrev(false)
        })
      } else {
        await this.slides.lockSwipeToPrev(true)
        this.swipeLeftLock = true
      }
    }
  }

  async loadMarkedVerses() {
    this.markersData = await this.storage.getData('marked')
    console.log(this.markersData)
  }

  setSlideContent(index, data) {
    //console.log('dataa',data);

    setTimeout(() => {
      var slideNodeList = document.querySelectorAll('ion-slides#bible-slides ion-text')
      var slideArray = Array.from(slideNodeList);
      var slideElements = <HTMLIonTextElement[]>slideArray
      this.removeAllChild(slideElements[index])

      // Filling chapter content
      let spaceDIV = '<div class="w-full chapter-space"></div>' //h-36 or h-0
      slideElements[index].insertAdjacentHTML('beforeend', data.content + spaceDIV)

      // Color markers
      var spanArray = Array.from(document.querySelectorAll('span.verse-span'))
      var spanElementArray = <HTMLParagraphElement[]>spanArray
      spanElementArray.forEach((span => {
        let dataVerseId = span.getAttribute('data-verse-id')
        let markedVerse = this.markersData.find(marked => marked.verse == dataVerseId)
        /** Setting mark if have mark */
        if (markedVerse !== undefined) {
          const verseSegments = Array.from(document.querySelectorAll('[data-verse-id="' + `${dataVerseId}` + '"]'))
          verseSegments.forEach(verse => {
            verse.classList.add(markedVerse.color)
          })
          //var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
        }

        span.addEventListener('click', (clickEvent: MouseEvent) => {
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
          clickEvent.stopImmediatePropagation()

          let verseId = span.getAttribute('data-verse-id')
          const verseSegments = Array.from(document.querySelectorAll('[data-verse-id="' + `${verseId}` + '"]'))
          var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments

          if (!this.selectedVerseArray.some(verse => verse.verseId == verseId)) {
            verseSegmentsElementArray.forEach(verseSpan => {
              verseSpan.classList.add('selected-verse')
            })
            this.selectedVerseArray.push({
              verseId: verseId,
              bibleId: this.sharedInfo.bible.id
            })

            this.noteSelectionSheet.openSheet(this.selectedVerseArray)
            this.openSpace()
          } else {
            verseSegmentsElementArray.forEach(verseSpan => {
              verseSpan.classList.remove('selected-verse')
            })
            let index = this.selectedVerseArray.findIndex((verse) => verse.verseId == verseId)
            this.selectedVerseArray = this.arrayRemove(this.selectedVerseArray, this.selectedVerseArray[index])

            if (this.selectedVerseArray.length == 0) {
              this.noteSelectionSheet.closeSheet()
              this.closeSpace()
            } else {
              this.noteSelectionSheet.updatePassageReference(this.selectedVerseArray)
            }
          }
        })
      }))
    })
  }

  openSpace() {
    let space = document.getElementsByClassName('chapter-space')
    for (let i = 0; i < space.length; i++) {
      if (!space[i].classList.contains('h-36'))
        space[i].classList.add('h-36')
    }
  }

  closeSpace() {
    let space = document.getElementsByClassName('chapter-space')
    for (let i = 0; i < space.length; i++) {
      if (space[i].classList.contains('h-36'))
        space[i].classList.remove('h-36')
    }
  }

  unselectAll() {
    if (this.selectedVerseArray.length != 0) {
      const verseSegments = Array.from(document.getElementsByClassName('selected-verse'))
      var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
      verseSegmentsElementArray.forEach(verseSpan => {
        verseSpan.classList.remove('selected-verse')
      })
      this.selectedVerseArray.length = 0
    }
    this.closeSpace()
  }

  arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele != value;
    });
  }

  closeSelectionSheet(updateMarks) {
    this.unselectAll()
  }

  updateMarks() {

  }

  chapterToSlideDistribution(activeIndex, data, dataType: 'actual' | 'next' | 'previous') {
    switch (dataType) {
      case 'actual':
        this.showedChapters[activeIndex - 1] = data
        this.setSlideContent(activeIndex, data)
        this.activeChapter = data
        break
      case 'next':
        this.showedChapters[this.loopIn3Next(activeIndex) - 1] = data
        this.setSlideContent(this.loopIn3Next(activeIndex), data)
        if (activeIndex === 3) {
          //document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = data.content
          this.setSlideContent(4, data)
        }
        break
      case 'previous':
        this.showedChapters[this.loopIn3Prev(activeIndex) - 1] = data
        this.setSlideContent(this.loopIn3Prev(activeIndex), data)
        if (activeIndex === 1) {
          //document.getElementsByClassName('swiper-slide-prev')[0].children[0].innerHTML = data.content
          this.setSlideContent(0, data)
        }
        break
    }
    //console.log('showed: ', this.showedChapters)
  }

  loopIn3Next(index) {
    var result
    if (index < 3) result = index + 1
    else result = 1
    return result
  }

  loopIn3Prev(index) {
    var result
    if (index > 1) result = index - 1
    else result = 3
    return result
  }


  /*TODO: Updatating chapter issue
  * If I am in a spanish bible on Genesis, and I change to an English(or maybe Spanish?)
  * bible with only New Testament, I can't see Mattew until I touch and move the slide,
  * seems like the duplicate slide is not updated well, but its not the duplicated slide.
  * Allan Bennett. July 10, 2022
  */
  bibleChange(bible) {
    //this.selectedBible = bible
    this.noteSelectionSheet.closeSheet()
    this.closeSpace()
    console.log('on bible change', bible.id, this.sharedInfo.chapter?.id);
    this.storeLastChapter({ bibleId: bible.id, chapterId: this.sharedInfo.chapter?.id || 'GEN.1' })
    this.setChapter(bible.id, this.sharedInfo.chapter?.id || 'GEN.1')
  }

  chapterChange(chapter) {
    //this.selectedChapter = chapter
    this.sharedInfo.chapter = chapter
    //console.log('chapter change',chapter);
    let toStore = _.pick(chapter, 'bibleId', 'id')
    this.storeLastChapter({ bibleId: toStore.bibleId, chapterId: toStore.id })

    this.noteSelectionSheet.closeSheet()
    this.closeSpace()
    this.setChapter(chapter.bibleId, chapter.id)
  }

  storeLastChapter(chapter: { bibleId: string, chapterId: string }) {
    console.log('toStore', chapter);
    this.storage.setLastChapter(chapter)
  }

  getBibleFirstChapter() {
    var auxCh
    this.apiService.getBibleFirstChapter(this.sharedInfo.bible.id).then(async (chapter) => {
      auxCh = chapter
      //console.log('change',chapter);

      //this.selectedChapter = chapter
      this.sharedInfo.chapter = chapter
      this.start = true
      //var ind = await this.slides.getActiveIndex()
      //console.log('first ind: ',ind)
      await this.slides.lockSwipeToPrev(true)
      this.swipeLeftLock = true
      this.setChapterFirstTime(this.sharedInfo.bible.id, auxCh.id)
    }, err => console.log(err))
  }

  async setDefaultData() {
    //this.selectedBible = data.bibleId//data.defaultBible//data.bibleId //_.pick(data.defaultBible,'id')
    //this.selectedChapter = data.chapterId//data.defaultChapter// data.chapterId// _.pick(data.defaultChapter,'id')
    await this.slides.lockSwipeToPrev(true)
    this.swipeLeftLock = true
    this.setChapter(this.sharedInfo.bible.id, this.sharedInfo.chapter.id)
    //this.setChapterFirstTime(this.sharedInfo.bible.id, this.sharedInfo.chapter.id)
    //this.setChapterFirstTime(this.selectedBible.id, this.selectedChapter.id)
  }

  getAllLang() {
    var aux
    this.apiService.getAllLanguages().then(
      (languages) => {
        aux = languages
        aux.forEach(language => {
          console.log(language.id, language.name, language.nameLocal)
        })
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
