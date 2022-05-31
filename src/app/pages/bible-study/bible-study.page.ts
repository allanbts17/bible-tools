import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-bible-study',
  templateUrl: './bible-study.page.html',
  styleUrls: ['./bible-study.page.scss'],
})
export class BibleStudyPage implements OnInit {
  auxLanguages
  constructor(public apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getAllBibles().subscribe((bibles)=>{
      console.log(bibles)
    },(error)=>{
      console.log(error)
    })
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

  }


}
