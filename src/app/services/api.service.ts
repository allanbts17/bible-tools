import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BibleSummary } from '../interfaces/bible-summary';
import { Bible } from '../interfaces/bible';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  auxBibles
  base_url = "https://api.scripture.api.bible"
  reqHeader = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key':'30a8f65d4c9d905424846450db90b830'
  })

  constructor(private http: HttpClient) { }

  getAllBibles(){
    const path = `${this.base_url}`+"/v1/bibles";
    return this.http.get(path,{headers: this.reqHeader});
  }

  getBible(id){
    const path = `${this.base_url}`+"/v1/bibles/"+`${id}`;
    return this.http.get<Bible>(path,{headers: this.reqHeader});
  }

  getAllLanguages(){
    return new Promise((resolve, reject) => {
      this.getAllBibles().subscribe((bibles)=>{
        this.auxBibles = bibles
        var languages = []
        this.auxBibles.data.forEach(bible => {
          languages.push(bible.language)
        });
        resolve(languages)
      },(error)=>{
        reject(error)
      })
    });

  }

  getBiblesByLanguageId(id){
    return new Promise((resolve, reject) => {
      this.getAllBibles().subscribe((bibles)=>{
        this.auxBibles = bibles
        var bibleList = []
        this.auxBibles.data.forEach(bible => {
          if(id==bible.language.id)
            bibleList.push(bible)
        });
        resolve(bibleList)
      },(error)=>{
        reject(error)
      })
    });

  }

  getAllCountries(){

    this.getAllBibles().subscribe((bibles)=>{
      this.auxBibles = bibles
      var countries = []
      //console.log(this.auxBibles.data)
      this.auxBibles.data.forEach(bible => {
        countries.push()
        bible.countries.forEach(countrie => {
          countries.push(countrie)

        })
      });
      countries.forEach(countrie => {
        console.log(countrie.id,countrie.name,countrie.nameLocal)
      })
    },(error)=>{
      console.log(error)
    })

  }

}
