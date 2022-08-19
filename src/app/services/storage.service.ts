import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Note } from '../interfaces/note';
import { Category } from '../interfaces/category';

const NOTES_KEY = 'notes'
const CATEGORY_KEY = 'categories'
const TOPIC_KEY = "topics"
const MY_VERSES_KEY = "my-verses"
const SETTINGS_KEY = 'settings'
const MARKED_KEY = 'marked'
const ID = 'id'
//var notes = {}
var categories = []
var verses = {}
var topics = []
const pagSize = 10


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  notes = {}
  started = false

  constructor(private storage: Storage) {
    this.init();
    //setTimeout(()=> this.removeItem('categories',200),4000)
  }

  async editNote(){
    const notes = await this.storage.get(NOTES_KEY) || []
    const category = await this.storage.get(CATEGORY_KEY) || []
    notes.forEach(str => str.category = category.find(cat => cat.category == str.category).id)
    return this.storage.set(NOTES_KEY,notes)
    //console.log(notes)
  }


  async init(){
    await this.storage.create()
    await this.fillValues()
    console.log('all values: ',this.notes)
  }

  async fillValues(){
    categories = await this.getData(CATEGORY_KEY)
    let all = await this.filterNotesByCategory()
    Object.assign(this.notes,{'all':all})
    for(let category of categories){
      let cat = await this.filterNotesByCategory(category.id)
      Object.assign(this.notes,{[category.category]:cat})
    }
    this.started = true
  }

  async getNotes(category = null,pag = -1,full = false){
    await this.fillCheck()
    if(category === null){
      if(pag === -1){
        return {...this.notes}
      } else {
        let newObj = {}
        let all = await this.filterNotesByCategory(null,pag)
        Object.assign(newObj,{'all':all})
        for(let category of categories){
          let cat = await this.filterNotesByCategory(category.id,pag)
          Object.assign(newObj,{[category.category]:cat})
        }
        return newObj
      }
    } else {
      if(pag == -1){
        return this.notes[category].slice()
      } else {
        if(full){
          return this.notes[category].slice(0,pagSize*(pag+1))
        } else {
          return this.notes[category].slice(pagSize*pag,pagSize*(pag+1))
        }
      }
    }

  }

  async fillCheck(){
    return new Promise((resolve,reject)=> {
      let myInterval = setInterval(()=>{
        if(this.started){
          clearInterval(myInterval)
          resolve('it has started')
        }
      },20)
    })
  }

  async filterNotesByCategory(categoryId = null,pag = -1){
    let allNotes = await this.getData(NOTES_KEY)
    if(categoryId !== null){
      let filtered = allNotes.filter(note => note.category === categoryId)
      return pag === -1? filtered:filtered.slice(pagSize*pag,pagSize*(pag+1))
    } else {
      return pag === -1? allNotes:allNotes.slice(pagSize*pag,pagSize*(pag+1))
    }
  }

  public async getID(){
    const extractedID = await this.storage.get(ID) || 1
    await this.storage.set(ID,extractedID + 1)
    return extractedID
  }

  setSettings(settings){
    return this.storage.set(SETTINGS_KEY,settings)
  }

  async getSettings(){
    var default_settings = {
      darkMode: false,
      lang: 'es'
    }
    const storedData = await this.storage.get(SETTINGS_KEY)
    if(storedData == null) this.setSettings(default_settings)
    return storedData || default_settings
  }

  async getData(key){
    return await this.storage.get(key) || []
  }

  async sortData(key,func){
    const storedData = await this.storage.get(key) || []
    storedData.sort(func)
    return this.storage.set(key,storedData)
  }

  async addData(key: string, item: any){
    item.id = await this.getID()
    const storedData = await this.storage.get(key) || []
    storedData.push(item)
    return this.storage.set(key,storedData)
  }

  async editItemByID(key: string, item: any){
    var storedData = await this.storage.get(key) || []
    const index = storedData.findIndex(obj => obj.id == item.id)
    storedData[index] = item
    //console.log('from service data: ',storedData)
    return this.storage.set(key,storedData)
  }

  async removeItemByID(key: string, item: any){

    const storedData = await this.storage.get(key) || []
    var index = storedData.findIndex(obj => obj.id == item.id)
    storedData.splice(index,1)
    return this.storage.set(key,storedData)
  }

  async removeItem(key: string, index: number){
    console.log('enter on remove')
    const storedData = await this.storage.get(key) || []
    storedData.splice(index,1)
    return this.storage.set(key,storedData)
  }
}
