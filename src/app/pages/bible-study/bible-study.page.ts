import { Component, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IonSlides } from '@ionic/angular';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BibleStudyPage implements OnInit {
  @ViewChild('slide') slides: IonSlides;
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

  constructor(public apiService: ApiService) {
    this.getAvailablaBibles()
  }

  ngOnInit() {


   /* setTimeout(() => {
      var dup = document.getElementsByClassName('swiper-slide-duplicate')
      dup[0].innerHTML = "Hola mundo"
      console.log(dup)
    },2000)*/

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
        document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = this.showedChapters[2].content
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
          console.log('entered',document.getElementsByClassName('swiper-slide-duplicate'))
          document.getElementsByClassName('swiper-slide-prev')[0].children[0].innerHTML = this.showedChapters[0].content
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

  chapterToSlideDistribution(activeIndex,data,dataType: 'actual'|'next'|'previous'){
    switch(dataType){
      case 'actual':
        this.showedChapters[activeIndex-1] = data
        this.activeChapter = data
        break
      case 'next':
        this.showedChapters[this.loopIn3Next(activeIndex)-1] = data
        if(activeIndex === 3){
          document.getElementsByClassName('swiper-slide-next')[0].children[0].innerHTML = data.content
        }
        break
      case 'previous':
        this.showedChapters[this.loopIn3Prev(activeIndex)-1] = data
        if(activeIndex === 1){
          document.getElementsByClassName('swiper-slide-prev')[0].children[0].innerHTML = data.content
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
    this.setChapter(bible.id,this.selectedChapter?.id || 'GEN.1')
  }

  chapterChange(chapter){
    this.selectedChapter = chapter
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


}
