import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
})
export class BibleStudyPage implements OnInit {
  auxLanguages
  bibleText
  constructor(public apiService: ApiService) { }

  ngOnInit() {
    /*this.apiService.getAllBibles().subscribe(bibles => {
     // var obj = bibles
      ///this.bibleText = obj
      console.log(bibles)
    },(err)=> console.log(err))*/
   /*this.apiService.getAllBibles().subscribe((bibles)=>{
      console.log(bibles)
    },(error)=>{
      console.log(error)
    })*/
    /*this.apiService.getAllLanguages().then(
      (languages) => {
        this.auxLanguages = languages
        this.auxLanguages.forEach(language => {
          console.log(language.id,language.name,language.nameLocal)
        })
      },
      (err) => console.error(err)
    );*/

    /*this.apiService.getBiblesByLanguageId("spa").then((bibles)=>{
      console.log(bibles)
    })*/
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

    //'b32b9d1b64b4ef29-01'

  }


}
