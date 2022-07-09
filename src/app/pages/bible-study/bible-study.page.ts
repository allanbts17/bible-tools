import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IonSlides } from '@ionic/angular';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
})
export class BibleStudyPage implements OnInit {
  @ViewChild('slide') slides: IonSlides;
  availableBibleLanguages = [{id:"spa",name:"Español"},{id:"eng",name:"English"}]
  bibles = []
  selectedBible
  bibleText
  passageText = "Génesis 1"
  selectedChapter
  showedChapters = [{},{},{}]
  myOptions: SwiperOptions = {
    //allowTouchMove: false,
    loop:true,
   // loopPreventsSlide:false
};

  constructor(public apiService: ApiService) {
    this.getAvailablaBibles()
  }

  ngOnInit() {

    setTimeout(() => {
      var dup = document.getElementsByClassName('swiper-slide-duplicate')
      dup[0].innerHTML = "Hola mundo"
      console.log(dup)
    },2000)

  }

  setChapter(bibleId,chapterId){
    this.apiService.getChapter(bibleId,chapterId).subscribe((chapterContent)=>{
      console.log(chapterContent)
      this.bibleText = chapterContent
      this.selectedChapter = {
        id: this.bibleText.data.id,
        number: this.bibleText.data.number,
        reference: this.bibleText.data.reference,
        bookId: this.bibleText.data.bookId
      }
      this.updateText({...this.bibleText.data})
      setTimeout(() => {
      var len = document.getElementsByTagName("span").length
      for(let i=0;i<len;i++){
        document.getElementsByTagName("span")[i].style.fontWeight = "500"
        document.getElementsByTagName("span")[i].style.marginRight = "5px"
      }
    })

    },error => {

      if(error.error.statusCode === 404){
        this.getBibleFirstChapter()
      } else {
        console.log(error)
      }
    })
  }

  setExternChapters(){

  }

  updateText(textData){
    let index = this.slides.getActiveIndex()

    if(textData?.previous != undefined && textData?.next != undefined){
      this.showedChapters[1] = textData
      var data
      this.apiService.getChapter(textData.bibleId,textData.previous.id).subscribe((chapterContent)=>{
        data = chapterContent
        this.showedChapters[0] = data.data
        this.apiService.getChapter(textData.bibleId,textData.next.id).subscribe((chapterContent)=>{
          data = chapterContent
          this.showedChapters[2] = data.data
        })
      })
    }
  }

  async transitionFinished(){
    let index = await this.slides.getActiveIndex()
    console.log(index)
    /*if(index == 0){
      this.slides.lockSwipes(true)
    } else {
      this.slides.lockSwipes(false)
      this.slides.lockSwipeToNext(true)
    }*/

  }

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
    this.apiService.getBibleFirstChapter(this.selectedBible.id).then(chapter => {
      auxCh = chapter
      this.selectedChapter = chapter
      this.setChapter(this.selectedBible.id,auxCh.id)
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
