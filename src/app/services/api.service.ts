import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BibleSummary } from '../interfaces/bible-summary';
import { Bible } from '../interfaces/bible';
import { RequestService } from './request.service';
import { log } from '../classes/utils';


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
  chapterHeader = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key':'30a8f65d4c9d905424846450db90b830',

  })
  RV_reqHeader = new HttpHeaders({
    'Content-Type': 'application/html',
    'Access-Control-Allow-Origin':'*'
  })

  constructor(private req: RequestService) { }

  getAllBibles(){
    const path = `${this.base_api_endpoint}`+"/v1/bibles";
    return this.req.request(path,{headers: this.reqHeader});
  }
 /* getAllBibles(){
    const path = `${this.bible_com_endpoint}`+"/find?key="+this.bible_com_key;
    return this.request(path);
  }*/

  getBibleBookList(id){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${id}`+"/books";
    return this.req.request(path,{headers: this.reqHeader});
  }

  getBibleFirstChapter(bibleId){
    var aux
    return new Promise((resolve, reject) => {
      var bookList
      var chapterList
      this.getBibleBookList(bibleId).subscribe(books => {
        aux = books
        bookList = aux.data
        this.getChapterList(bibleId,bookList[0].id).subscribe(chapters => {
          aux = chapters
          chapterList = aux.data
          resolve(chapterList[0].number === 'intro'? chapterList[1]:chapterList[0])
        },error => {
          reject(error)
        })
      },error => {
        reject(error)
      })
    })
  }

  getChapterList(bibleId,bookId,showLoading = true){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/books/"+`${bookId}`+"/chapters";
    return this.req.request(path,{headers: this.reqHeader},true,showLoading);
  }

  /*TODO: Configure to add notes
  * On bible-study.page, I can see Gn 1 RVR09 on reference bible app
  */
  getChapter(bibleId,chapterId,showLoding = false,includeNotes=false){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/chapters/"+`${chapterId}`+'?include-verse-spans=true&include-notes='+`${includeNotes}`+'&fums-version=3';
    const url = path
    var includeNotes = true
    const ur = `${url}include-notes=${includeNotes}&`;
    /*this.getVerses(bibleId,chapterId).subscribe(ver => {
      console.log(ver)
    })*/

    return this.req.request(path,{headers: this.chapterHeader},true,showLoding);
  }

  /**passageId example: REV.10.3-REV.10.6 */
  getPassage(bibleId,passageId){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/passages/"+`${passageId}`+'?content-type=html&include-verse-spans=true&';
    return this.req.request(path,{headers: this.reqHeader});
  }

  getVerses(bibleId,chapterId){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/chapters/"+`${chapterId}`+"/verses";
    return this.req.request(path,{headers: this.reqHeader});
  }

  getVerse(bibleId,verseId){
    const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/verses/"+`${verseId}`;
    return new Promise((resolve, reject) => {
      this.req.request(path,{headers: this.reqHeader}).subscribe(verse =>{
        resolve(verse)
      },err=>reject(err))
    })
  }


  // getBookSectionList(bibleId,bookId){
  //   const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${bibleId}`+"/books/"+`${bookId}`+"/sections";
  //   return this.req.request(path,{headers: this.reqHeader});
  // }

  // getBibleContent(){
  //   const path = `${this.bible_com_endpoint}`+"/content/rvr60.html.js?passage=Jn&key="+this.bible_com_key;
  //   return this.req.request(path,{headers:this.RV_reqHeader});
  // }

  // getBible(id){
  //   const path = `${this.base_api_endpoint}`+"/v1/bibles/"+`${id}`;
  //   return this.req.request<Bible>(path,{headers: this.reqHeader});
  // }

  // getRVBibleBookList(){
  //   const path = this.spanish_api_endpoint + "/books"
  //   return this.req.request(path,{headers:this.RV_reqHeader});
  // }

  // getRVBibleBook(bookId){
  //   const path = this.spanish_api_endpoint + "/books/" + `${bookId}`
  //   return this.req.request(path);
  // }

  // getRVBibleVerses(bookId,verses){
  //   const path = this.spanish_api_endpoint + "/books/" + `${bookId}` + "/verses/" + `${verses}`
  //   return this.req.request(path);
  // }

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
        // this.auxBibles.data.forEach(bible => {
        //   if(id==bible.language.id)
        //     bibleList.push(bible)
        // });
        console.log(this.auxBibles)
        log(bibles)
        bibleList = this.auxBibles.data.filter(bible => id==bible.language.id);
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
