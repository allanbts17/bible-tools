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
  base_api_endpoint = "https://api.scripture.api.bible"
  spanish_api_endpoint = "https://bible-app-demo.herokuapp.com/api"
  bible_com_key = 'da2da2615f04e97a3bac7d9aba71615d'
  bible_com_endpoint = 'https://api.biblia.com/v1/bible'
  reqHeader = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key':'30a8f65d4c9d905424846450db90b830'
  })
  RV_reqHeader = new HttpHeaders({
    'Content-Type': 'application/html',
    'Access-Control-Allow-Origin':'*'
  })

  constructor(private http: HttpClient) { }

  getAllBibles(){
    const path = `${this.base_api_endpoint}`+"/v1/bibles";
    return this.http.get(path,{headers: this.reqHeader});
  }
 /* getAllBibles(){
    const path = `${this.bible_com_endpoint}`+"/find?key="+this.bible_com_key;
    return this.http.get(path);
  }*/

  getBibleBookList(id){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${id}`+"/books";
    return this.http.get(path,{headers: this.reqHeader});
  }

  getChapterList(bibleId,bookId){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/books/"+`${bookId}`+"/chapters";
    return this.http.get(path,{headers: this.reqHeader});
  }

  getChapter(bibleId,chapterId){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/chapters/"+`${chapterId}`;
    return this.http.get(path,{headers: this.reqHeader});
  }

  getBookSectionList(bibleId,bookId){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/books/"+`${bookId}`+"/sections";
    return this.http.get(path,{headers: this.reqHeader});
  }

  getBibleContent(){

    const path = `${this.bible_com_endpoint}`+"/content/rvr60.html.js?passage=Jn&key="+this.bible_com_key;
    return this.http.get(path,{headers:this.RV_reqHeader});
  }

  getBible(id){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${id}`;
    return this.http.get<Bible>(path,{headers: this.reqHeader});
  }

  getRVBibleBookList(){

    const path = this.spanish_api_endpoint + "/books"
    return this.http.get(path,{headers:this.RV_reqHeader});
  }

  getRVBibleBook(bookId){
    const path = this.spanish_api_endpoint + "/books/" + `${bookId}`
    return this.http.get(path);
  }

  getRVBibleVerses(bookId,verses){
    const path = this.spanish_api_endpoint + "/books/" + `${bookId}` + "/verses/" + `${verses}`
    return this.http.get(path);
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
