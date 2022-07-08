import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
})
export class BibleStudyPage implements OnInit {
  availableBibleLanguages = [{id:"spa",name:"Español"},{id:"eng",name:"English"}]
  bibles = []
  selectedBible
  bibleText
  passageText = "Génesis 1"
  constructor(public apiService: ApiService) {
    this.getAvailablaBibles()
  }

  ngOnInit() {

    this.apiService.getBibleBookList('b32b9d1b64b4ef29-01').subscribe((books)=>{
      console.log(books)
      this.apiService.getChapterList('b32b9d1b64b4ef29-01','GEN').subscribe((bibles)=>{
        console.log(bibles)
      })
      this.apiService.getChapter('b32b9d1b64b4ef29-01','GEN.1').subscribe((bibles)=>{
        console.log(bibles)
        this.bibleText = bibles
        setTimeout(() => {
          var len = document.getElementsByTagName("span").length
          for(let i=0;i<len;i++){
            document.getElementsByTagName("span")[i].style.fontWeight = "500"
            document.getElementsByTagName("span")[i].style.marginRight = "5px"
          }

        })
      })
    })
  }

  getChapterList(bibleId,chapterId){

  }
  setChapter(bibleId,chapterId){
    this.apiService.getChapter(bibleId,chapterId).subscribe((bibles)=>{
      console.log(bibles)
      this.bibleText = bibles
      setTimeout(() => {
      var len = document.getElementsByTagName("span").length
      for(let i=0;i<len;i++){
        document.getElementsByTagName("span")[i].style.fontWeight = "500"
        document.getElementsByTagName("span")[i].style.marginRight = "5px"
      }
    })

    })
  }

  bibleChange(bible){
    this.selectedBible = bible
    this.setChapter(bible.id,'GEN.1')
  }

  chapterChange(chapter){
    this.passageText = chapter.reference
    this.setChapter(chapter.bibleId,chapter.id)
  }

  getAllBibles(){
    this.apiService.getAllBibles().subscribe((bibles)=>{
      console.log(bibles)
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
    console.log(this.bibles[0])
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
