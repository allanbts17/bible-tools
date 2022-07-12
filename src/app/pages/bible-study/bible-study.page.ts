import { Component, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IonSlides } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { NoteSelectionSheetComponent } from 'src/app/components/note-selection-sheet/note-selection-sheet.component';


@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BibleStudyPage implements OnInit {
  @ViewChild('slide') slides: IonSlides;
  @ViewChild('sheet') noteSelectionSheet: NoteSelectionSheetComponent;
  availableBibleLanguages = [{id:"spa",name:"Español"},{id:"eng",name:"English"}]
  bibles = []
  selectedBible
  bibleText
  passageText = "Génesis 1"
  selectedChapter
  showedChapters = [
    {content:"",bibleId:"",id:""},
    {content:"",bibleId:"",id:""},
    {content:"",bibleId:"",id:""}
  ]
  activeChapter
  myOptions: SwiperOptions = {
    //allowTouchMove: false,
    loop:true,
    //touchAngle: 45 May help to not slide accidentaly when scrolling down/up
    //longSwipes:false
   // loopPreventsSlide:false
};
  swipeLeftLock = false
  swipeRightLock = true
  slideIndex = 1
  start = false
  selectedVerseArray = []

  constructor(public apiService: ApiService) {
    this.getAvailablaBibles()
  }

  ngOnInit() {


   setTimeout(() => {

    const ele = document.querySelector('[data-verse-id="GEN.1.1"]');
    console.log(ele);

    var n = []
    var paragraphArray = Array.from(document.querySelectorAll('p.test'))
    var parrElementArray = <HTMLParagraphElement[]>paragraphArray
    parrElementArray.forEach(parr => {
      let chn = parr.childNodes
      chn.forEach(nod => {
        //console.log(nod.nodeType)

        n.push(<HTMLParagraphElement>nod)
      })
    })
    console.log(n)
    n.forEach(nc => {
      //nc.textContent = 'changee'
      nc.addEventListener('click',(clickEvent: MouseEvent)=>{
        nc.style.textDecoration = "underline dotted"
        console.log(clickEvent)
      })
    })

    var g: ChildNode
    //g.nodeType
    var b = <HTMLParagraphElement>g
    //b.style



    //var dup = document.getElementsByTagName('p')
    var dap = document.querySelectorAll('ion-slides#bible-slides p')
    var il = Array.from(dap);
    var dup = <HTMLParagraphElement[]>il
    //var dfd = dup[0].childNodes

    //var dup = <HTMLParagraphElement[]>Array.from(document.querySelectorAll('ion-slides#bible-slides p'));
    //var dup = <HTMLParagraphElement>document.querySelector('ion-slides#bible-slides p')
    //console.log(dup)
    var el
    for(let i=0;i<dup.length;i++){

      dup[i].addEventListener('click',(clickEvent: MouseEvent)=>{

        dup[i].style.textDecoration = "underline dotted"
        //console.log('Click Event Details: ', clickEvent)
      })
    }


      //console.log(dup)
    },2000)

  }

  setSelectedChapterInfo(data){
    this.selectedChapter = {
      id: data.id,
      number: data.number,
      reference: data.reference,
      bookId: data.bookId
    }
  }
/**
 * if(index === 1){
          document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = this.showedChapters[2].content
        }
 */
  setChapter(bibleId,chapterId){
    var aux, chapter

    this.apiService.getChapter(bibleId,chapterId).subscribe(async (chapterContent)=>{
      aux = chapterContent
      chapter = aux.data
      //console.log(chapter)

      this.chapterToSlideDistribution(this.slideIndex,chapter,'actual')


      if(chapter?.next != undefined){
        this.apiService.getChapter(chapter.bibleId,chapter.next.id).subscribe((chapterContent)=>{
          aux = chapterContent
          this.chapterToSlideDistribution(this.slideIndex,aux.data,'next')
          if(this.swipeRightLock) this.slides.lockSwipeToNext(false)
        })
      } else {
        await this.slides.lockSwipeToNext(true)
        this.swipeRightLock = true
      }

      if(chapter?.previous != undefined && chapter?.previous.number != 'intro'){
        this.apiService.getChapter(chapter.bibleId,chapter.previous.id).subscribe((chapterContent)=>{
          aux = chapterContent
          this.chapterToSlideDistribution(this.slideIndex,aux.data,'previous')
          if(this.swipeLeftLock) this.slides.lockSwipeToPrev(false)
        })
    } else {
      await this.slides.lockSwipeToPrev(true)
      this.swipeLeftLock = true
    }

    },error =>{
      if(error.error.statusCode === 404){
        this.getBibleFirstChapter()
      } else {
        console.log(error)
      }
    })
  }
  setChapterFirstTime(bibleId,chapterId){
    var aux
    this.apiService.getChapter(bibleId,chapterId).subscribe((chapterContent)=>{
      console.log(chapterContent)
      aux = chapterContent

      //this.apiService.getChapterInVerses(bibleId,chapterId)

      this.bibleText = aux.data
      this.setSelectedChapterInfo(this.bibleText)
      this.chapterToSlideDistribution(this.slideIndex,this.bibleText,'actual')
      this.apiService.getChapter(this.bibleText.bibleId,this.bibleText.next.id).subscribe((chapterContent)=>{
        aux = chapterContent
        this.chapterToSlideDistribution(this.slideIndex,aux.data,'next')
        if(this.swipeRightLock) this.slides.lockSwipeToNext(false)
      })
    },error => {

      if(error.error.statusCode === 404){
        this.getBibleFirstChapter()
      } else {
        console.log(error)
      }
    })
  }

  /** When index changes have 1,2 difference is 1
   * when changes have 1,3 diference is 2
  */
  swipeDirection(index): 'right'|'left'|'stay'{
    var diff = index - this.slideIndex
    if(diff === 1 || diff === -2){
      return 'right'
    } else if (diff === -1 || diff === 2){
      return 'left'
    } else {
      return 'stay'
    }
  }

  async unlockSwipe(direction: 'right'|'left'){
    if(direction === 'right'){
      if(this.swipeLeftLock) {
        await this.slides.lockSwipeToPrev(false)
        this.swipeLeftLock = false
      }
    } else {
      if(this.swipeRightLock) {
        await this.slides.lockSwipeToNext(false)
        this.swipeRightLock = false
      }
    }
  }

  async getActiveIndex(){
    let index = await this.slides.getActiveIndex()
    index = index === 4? 1:index
    index = index === 0? 3:index
    return index
  }

  /*TODO: Bug if swipe is too fast
   * If I swipe many times too fast, it returns to the loop's start
   * too soon, before data updates
   */
  async transitionFinished(): Promise<void>{
    if(this.start){
      let index = await this.getActiveIndex()
      let direction = this.swipeDirection(index)
      this.setSelectedChapterInfo(this.showedChapters[index-1])
      console.log('ind: ',index)//'prev: ',this.slideIndex)
      this.slideIndex = index

      this.noteSelectionSheet.closeSheet()
      //var dup = document.getElementsByClassName('swiper-slide-duplicate')
      //console.log(dup)
      if(direction !== 'stay'){
        this.unlockSwipe(direction)
        this.updateText(this.showedChapters[index-1],direction,index)
      }

    }
  }

  async updateText(textData,direction,index){
    //console.log(index)
    //let lastIndex = await this.slides.getPreviousIndex()
    //this.chapterToSlideDistribution(index,textData,'actual')
    var data

    if(direction === 'right'){
      if(index === 1){
        //document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = this.showedChapters[2].content
        this.setSlideContent(0,this.showedChapters[2])
      }
      if(textData?.next != undefined){
        this.apiService.getChapter(textData.bibleId,textData.next.id).subscribe((chapterContent)=>{
          data = chapterContent
          this.chapterToSlideDistribution(index,data.data,'next')
          if(this.swipeRightLock) this.slides.lockSwipeToNext(false)
        })
      } else {
        this.slides.lockSwipeToNext(true)
        this.swipeRightLock = true
      }
    } else {
        if(index === 3){
          //console.log('entered',document.getElementsByClassName('swiper-slide-duplicate'))
          //document.getElementsByClassName('swiper-slide-prev')[0].children[0].innerHTML = this.showedChapters[0].content
          this.setSlideContent(4,this.showedChapters[0])
        }
      if(textData?.previous != undefined && textData?.previous.number != 'intro'){
        this.apiService.getChapter(textData.bibleId,textData.previous.id).subscribe((chapterContent)=>{
          data = chapterContent
          this.chapterToSlideDistribution(index,data.data,'previous')
          if(this.swipeLeftLock) this.slides.lockSwipeToPrev(false)
        })
    } else {
      await this.slides.lockSwipeToPrev(true)
      this.swipeLeftLock = true
    }
    }
  }

  /*TODO: Store click verses to use the info */
  setSlideContent(index,data){
    setTimeout(() => {
      var slideNodeList = document.querySelectorAll('ion-slides#bible-slides ion-text')
      var slideArray = Array.from(slideNodeList);
      var slideElements = <HTMLIonTextElement[]>slideArray
      this.removeAllChild(slideElements[index])
      //console.log(data,index)
      slideElements[index].insertAdjacentHTML('beforeend', data.content )

      //var verse = document.querySelectorAll('[data-verse-id="GEN.1.2"]')
      var spanArray = Array.from(document.querySelectorAll('span.verse-span'))
      var spanElementArray = <HTMLParagraphElement[]>spanArray
      spanElementArray.forEach((span => {
        //let att = span.getAttribute('data-verse-id')
        //console.log(att)
        span.addEventListener('click',(clickEvent: MouseEvent)=>{
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
          clickEvent.stopImmediatePropagation()

          let verseId = span.getAttribute('data-verse-id')
          //console.log(this.selectedVerseArray.find(verse => verse.verseId == verseId),verseId)
          const verseSegments = Array.from(document.querySelectorAll('[data-verse-id="'+`${verseId}`+'"]'))
          var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments

          if(!this.selectedVerseArray.some(verse => verse.verseId == verseId)){
            verseSegmentsElementArray.forEach(verseSpan => {
              verseSpan.classList.add('selected-verse')
            })
            this.selectedVerseArray.push({
              verseId: verseId,
              bibleId: this.selectedBible.id
            })
            /*TODO: Abrir componente para vers. seleccionados
            * En esta línea una función o línea de código abre un componente
            * para hacer algo con los versículos seleccionados
            */
           this.noteSelectionSheet.openSheet(this.selectedVerseArray)
            //console.log(this.selectedVerseArray)
          } else {
            verseSegmentsElementArray.forEach(verseSpan => {
              verseSpan.classList.remove('selected-verse')
            })
            let index = this.selectedVerseArray.findIndex((verse) => verse.verseId == verseId)
            this.selectedVerseArray = this.arrayRemove(this.selectedVerseArray,this.selectedVerseArray[index])
            //console.log(this.selectedVerseArray)
           if(this.selectedVerseArray.length == 0){
            /*TODO: Cerrar componente para vers. seleccionados
            * En esta línea una función o línea de código cierra el componente
            * para hacer algo con los versículos seleccionados
            */
            this.noteSelectionSheet.closeSheet()
           }
          }
        })
      }))
    })
  }

  unselectAll(){
    if(this.selectedVerseArray.length != 0){
      const verseSegments = Array.from(document.getElementsByClassName('selected-verse'))
    var verseSegmentsElementArray = <HTMLParagraphElement[]>verseSegments
    verseSegmentsElementArray.forEach(verseSpan => {
      verseSpan.classList.remove('selected-verse')
    })
    this.selectedVerseArray.length = 0
    }
  }

  arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}

  chapterToSlideDistribution(activeIndex,data,dataType: 'actual'|'next'|'previous'){
    switch(dataType){
      case 'actual':
        this.showedChapters[activeIndex-1] = data
        this.setSlideContent(activeIndex,data)
        this.activeChapter = data
        break
      case 'next':
        this.showedChapters[this.loopIn3Next(activeIndex)-1] = data
        this.setSlideContent(this.loopIn3Next(activeIndex),data)
        if(activeIndex === 3){
          //document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = data.content
          this.setSlideContent(4,data)
        }
        break
      case 'previous':
        this.showedChapters[this.loopIn3Prev(activeIndex)-1] = data
        this.setSlideContent(this.loopIn3Prev(activeIndex),data)
        if(activeIndex === 1){
          //document.getElementsByClassName('swiper-slide-prev')[0].children[0].innerHTML = data.content
          this.setSlideContent(0,data)
        }
        break
    }
    console.log('showed: ',this.showedChapters)
  }

  loopIn3Next(index){
    var result
    if(index < 3) result = index + 1
    else result = 1
    return result
  }

  loopIn3Prev(index){
    var result
    if(index > 1) result = index - 1
    else result = 3
    return result
  }


  /*TODO: Updatating chapter issue
  * If I am in a spanish bible on Genesis, and I change to an English(or maybe Spanish?)
  * bible with only New Testament, I can't see Mattew until I touch and move the slide,
  * seems like the duplicate slide is not updated well, but its not the duplicated slide.
  * Allan Bennett. July 10, 2022
  */
  bibleChange(bible){
    this.selectedBible = bible
    this.noteSelectionSheet.closeSheet()
    this.setChapter(bible.id,this.selectedChapter?.id || 'GEN.1')
  }

  chapterChange(chapter){
    this.selectedChapter = chapter
    this.noteSelectionSheet.closeSheet()
    this.setChapter(chapter.bibleId,chapter.id)
  }

  getAllBibles(){
    this.apiService.getAllBibles().subscribe((bibles)=>{
      //console.log(bibles)
    },(error)=>{
      console.log(error)
    })
  }

  async getAvailablaBibles(){
    for(let i=0;i<this.availableBibleLanguages.length;i++){
      let aux
      var lang = this.availableBibleLanguages[i]
      await this.apiService.getBiblesByLanguageId(lang.id).then((bibles)=>{
        aux = {
          lang:lang,
          bibles:bibles
      }
      this.bibles.push(aux)
    })
    }
    this.selectedBible = this.bibles[0].bibles[0]
    this.getBibleFirstChapter()

  }

  getBibleFirstChapter(){
    var auxCh
    this.apiService.getBibleFirstChapter(this.selectedBible.id).then(async (chapter) => {
      auxCh = chapter
      this.selectedChapter = chapter
      this.start = true
      //var ind = await this.slides.getActiveIndex()
      //console.log('first ind: ',ind)
      await this.slides.lockSwipeToPrev(true)
      this.swipeLeftLock = true
      this.setChapterFirstTime(this.selectedBible.id,auxCh.id)
    },err => console.log(err))
  }

  getAllLang(){
    var aux
    this.apiService.getAllLanguages().then(
      (languages) => {
        aux = languages
        aux.forEach(language => {
          console.log(language.id,language.name,language.nameLocal)
        })
      },
      (err) => console.error(err)
    );
  }

  removeAllChild(myNode){
    //console.log(myNode.children)
    while (myNode.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }
  }


}
