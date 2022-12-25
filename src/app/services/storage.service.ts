import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Note } from '../interfaces/note';
import { Category } from '../interfaces/category';
//import * as moment from 'moment'
import { Verse } from '../interfaces/verse';
import { Topic } from '../interfaces/topic';
//import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { NoteRepository } from '../repositories/note.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { VerseRepository } from '../repositories/verse.repository';
import { TopicRepository } from '../repositories/topic.repository';

const NOTES_KEY = 'notes'
const CATEGORY_KEY = 'categories'
const TOPIC_KEY = "topics"
const MY_VERSES_KEY = "my-verses"
const SETTINGS_KEY = 'settings'
const LAST_CHAPTER_KEY = 'last-chapter'
const MARKED_KEY = 'marked'
const ID = 'id'
const pagSize = 10


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  notes = {}
  categories: Category[] = []
  verses = {}
  topics = []
  notePages = {}
  versePages = {}

  constructor(private storage: Storage,
    private noteRep: NoteRepository,
    private verseRep: VerseRepository,
    private categoryrRep: CategoryRepository,
    private topicRep: TopicRepository) {
    //this.init();
    //setTimeout(()=> this.removeItem(CATEGORY_KEY,200),4000)
  }

  async init() {
    await this.storage.create()
    //await this.storage.defineDriver(cordovaSQLiteDriver)
    await this.fillValues()
    //console.log('all values: ', this.notes)
  }

  async fillValues() {
    let cat = await this.categoryrRep.getCategories()
    let top = await this.topicRep.getTopics() //await this.getData(TOPIC_KEY)
    this.topics.push(...top)
    this.categories.push(...cat)

    let allVerses = await this.verseRep.getPaginatedVerses() //await this.filterVersesByTopic()
    let allNotes = await this.noteRep.getPaginatedNotes()

    /** Notes **/
    Object.assign(this.notes, { 'all': allNotes })
    for (let category of this.categories) {
      let nt = await this.noteRep.getNotesByCategory(category.id)
      Object.assign(this.notes, { [category.category]: nt })
    }

    for (const item in this.notes) {
      Object.assign(this.notePages, { [item]: this.getLastId(this.notes[item]) })
    }

    // console.log('fromS', this.notes);
    // console.log('fromS vers', this.verses);

    //await this.noteRep.fillIfEmpty(allNotes)

    /** Verses **/
    Object.assign(this.verses, { 'all': allVerses })
    for (let topic of this.topics) {
      let top = await this.verseRep.getVersesByTopic(topic.id) // await this.filterVersesByTopic(topic.id)
      Object.assign(this.verses, { [topic.name]: top })
    }
    for (const item in this.verses) {
      Object.assign(this.versePages, { [item]: this.getLastId(this.verses[item]) })
    }
  }

  getLastId(arr: Array<any>){
    //console.log('id err',arr);
    return arr.slice(-1)[0]?.id
  }

  /***************** Notes *******************/
  /**
   *
   * @param {{name: string, id: number}} tab Category of the notes
   * @returns {boolean} If new notes are empty
   */
  async loadMoreNotes(tab: {name: string, id: number}){
    let lastId = this.notePages[tab.name]
    let newNotes
    if(tab.id == -1) { // all have -1
      newNotes = await this.noteRep.getPaginatedNotes(lastId);
    } else {
      newNotes = await this.noteRep.getNotesByCategory(tab.id,lastId);
    }

    this.notes[tab.name].push(...newNotes)
    this.notePages[tab.name] = this.getLastId(newNotes)
    return newNotes.length === 0
  }

  async filterNotesByParam(param: string, value: string, category?: string){
    let lastId = this.notePages[category]
    let newNotes
    newNotes = await this.noteRep.filterNotesByParam(param,value,lastId,category)
    // if(category== 'all') {
    //   newNotes = await this.noteRep.getPaginatedNotes(lastId);
    // } else {
    //   newNotes = await this.noteRep.getNotesByCategory(category,lastId);
    // }

    this.notes[category].push(...newNotes)
    this.notePages[category] = this.getLastId(newNotes)
    return newNotes.length === 0
  }

  refillNotes(){

  }

  resetNotes() {
    this.notePages = {}
    this.notes = {}
    this.categories.forEach(cat => this.notes[cat.category] = [])
    this.notes['all'] = []
  }

  async loadMoreVerses(topic: string){
    let lastId = this.versePages[topic]
    let newVerses
    if(topic== 'all') {
      newVerses = await this.verseRep.getPaginatedVerses(lastId);
    } else {
      newVerses = await this.verseRep.getVersesByTopic(topic,lastId);
    }

    this.verses[topic].push(...newVerses)
    this.versePages[topic] = this.getLastId(newVerses)
    return newVerses.length === 0
  }


  async addNote(note: Note, categoryName: string) {
    let _note = await this.noteRep.createNote(note)
    this.notes[categoryName].unshift(_note)
    this.notes['all'].unshift(_note)
  }

  async deleteNote(note: Note) {
    await this.noteRep.deleteNoteById(note.id)
    let categoryName = this.categories.find(cat => cat.id === note.category)['category']
    this.notes[categoryName] = this.notes[categoryName].filter(arrNote => arrNote.id !== note.id)
    this.notes['all'] = this.notes['all'].filter(arrNote => arrNote.id !== note.id)
  }

  async editNote(note: Note, prevCategoryName) {
    console.log('is editing note',note);

    //await this.editItemByID(NOTES_KEY, note)
    await this.noteRep.updateNote(note)
    console.log('category of note',this.categories.find(cat => cat.id === note.category),this.categories);

    let newCategoryName = this.categories.find(cat => cat.id === note.category)['category']
    //let noteCatIndex = this.notes[prevCategoryName].findIndex(arrNote => arrNote.id === note.id)
    let noteAllIndex = this.notes['all'].findIndex(arrNote => arrNote.id === note.id)
    this.notes['all'][noteAllIndex] = note


    if (prevCategoryName !== newCategoryName) {
      this.notes[newCategoryName].unshift(note)
      this.notes[prevCategoryName] = this.notes[prevCategoryName].filter(arrNote => arrNote.id !== note.id)
    } else {
      let noteCatIndex = this.notes[prevCategoryName].findIndex(arrNote => arrNote.id === note.id)
      this.notes[newCategoryName][noteCatIndex] = note
    }
  }

  /***************** Verses *******************/
  async addVerse(verse: Verse, topicName: string) {
    let _verse = await this.verseRep.createVerse(verse)
    this.verses[topicName].unshift(_verse)
    this.verses['all'].unshift(_verse)
  }

  async deleteVerse(verse: Verse) {
    await this.verseRep.deleteVerseById(verse.id)
    let topicName = this.topics.find(top => top.id === verse.topic)['name']
    this.verses[topicName] = this.verses[topicName].filter(arrVerse => arrVerse.id !== verse.id)
    this.verses['all'] = this.verses['all'].filter(arrVerse => arrVerse.id !== verse.id)
    //console.log(this.verses);

  }

  async editVerse(verse: Verse, prevTopicName) {
    //await this.editItemByID(MY_VERSES_KEY, verse)
    await this.verseRep.updateVerse(verse)
    let newTopicName = this.topics.find(top => top.id === verse.topic)['name']
    let verseAllIndex = this.verses['all'].findIndex(arrVerse => arrVerse.id === verse.id)
    this.verses['all'][verseAllIndex] = verse
    if (prevTopicName !== newTopicName) {

      this.verses[newTopicName].unshift(verse)
      this.verses[prevTopicName] = this.verses[prevTopicName].filter(arrVerse => arrVerse.id !== verse.id)
      console.log('on edit verse', this.verses, prevTopicName, this.topics.find(top => top.id === verse.topic))
    } else {
      let verseTopIndex = this.verses[prevTopicName].findIndex(arrVerse => arrVerse.id === verse.id)
      this.verses[newTopicName][verseTopIndex] = verse
    }
  }

  /***************** Categories *******************/
  async addCategories(category: Category) {
    //let categoryArray = await this.addData(CATEGORY_KEY, category)
    let _category = await this.categoryrRep.createCategory(category)
    this.categories.push(_category)
    console.log('new category and list',category,this.categories);

    Object.assign(this.notes, { [category.category]: [] })
    Object.assign(this.notePages, { [category.category]: undefined })
    return await this.categoryrRep.getCategories()
  }

  async editCategories(category: Category, prevCategoryName: string) {
    //await this.editItemByID(CATEGORY_KEY, category)
    await this.categoryrRep.updateCategory(category)
    let index = this.categories.findIndex(cat => cat.id === category.id)
    this.categories[index] = category
    if (category.category !== prevCategoryName) {
      let prevNotes = this.notes[prevCategoryName].slice()
      delete this.notes[prevCategoryName]
      delete this.notePages[prevCategoryName]
      Object.assign(this.notes, { [category.category]: prevNotes })
      Object.assign(this.notePages, { [category.category]: 0 })
    }
  }

  async deleteCategory(category: Category) {
    // await this.removeItemByID(CATEGORY_KEY, category)
    await this.categoryrRep.deleteCategoryById(category.id)
    this.categories = this.categories.filter(arrCategory => arrCategory !== category)
  }

  async getCategories() {
    // let categories = await this.getData(CATEGORY_KEY)
    let categories = await this.categoryrRep.getCategories()
    return categories
  }

  /***************** Topics *******************/
  async addTopic(topic: Topic) {
    let _topic = await this.topicRep.createTopic(topic)
    this.topics.push(_topic)
    Object.assign(this.verses, { [topic.name]: [] })
    Object.assign(this.versePages, { [topic.name]: 0 })
    return await this.topicRep.getTopics()
  }

  async editTopic(topic: Topic, prevTopicName: string) {
    //await this.editItemByID(TOPIC_KEY, topic)
    await this.topicRep.updateTopic(topic)
    let index = this.topics.findIndex(top => top.id === topic.id)
    this.topics[index] = topic
    if (topic.name !== prevTopicName) {
      let prevVerses = this.verses[prevTopicName].slice()
      delete this.verses[prevTopicName]
      delete this.versePages[prevTopicName]
      Object.assign(this.verses, { [topic.name]: prevVerses })
      Object.assign(this.versePages, { [topic.name]: 0 })
    }
  }

  async deleteTopic(topic: Topic) {
    //await this.removeItemByID(TOPIC_KEY, topic)
    await this.topicRep.deleteTopicById(topic.id)
    this.topics = this.topics.filter(arrTopic => arrTopic !== topic)
  }

  async getTopics() {
    //let topics = await this.getData(TOPIC_KEY)

    return await this.topicRep.getTopics()
  }

  /***************** Last Chapter ***********/
  async setLastChapter(chapter){
    return await this.storage.set(LAST_CHAPTER_KEY, chapter)
  }

 async getLastChapter(){
    return await this.storage.get(LAST_CHAPTER_KEY)
  }

  /***************** Data *******************/
  public async getID() {
    const extractedID = await this.storage.get(ID) || 1
    await this.storage.set(ID, extractedID + 1)
    return extractedID
  }

  setSettings(settings) {
    return this.storage.set(SETTINGS_KEY, settings)
  }



  async getSettings() {
    var default_settings = {
      darkMode: false,
      lang: 'es'
    }
    const storedData = await this.storage.get(SETTINGS_KEY)
    if (storedData == null) this.setSettings(default_settings)
    return storedData || default_settings
  }

  async getData(key) {
    return await this.storage.get(key) || []
  }

  async sortData(key, func) {
    const storedData = await this.storage.get(key) || []
    storedData.sort(func)
    return this.storage.set(key, storedData)
  }

  async addData(key: string, item: any) {
    item.id = await this.getID()
    const storedData = await this.storage.get(key) || []
    storedData.push(item)
    return this.storage.set(key, storedData)
  }

  async editItemByID(key: string, item: any) {
    var storedData = await this.storage.get(key) || []
    const index = storedData.findIndex(obj => obj.id == item.id)
    storedData[index] = item
    //console.log('from service data: ',storedData)
    return this.storage.set(key, storedData)
  }

  async removeItemByID(key: string, item: any) {
    const storedData = await this.storage.get(key) || []
    var index = storedData.findIndex(obj => obj.id == item.id)
    storedData.splice(index, 1)
    return this.storage.set(key, storedData)
  }

  async removeItem(key: string, index: number) {
    console.log('enter on remove')
    const storedData = await this.storage.get(key) || []
    storedData.splice(index, 1)
    return this.storage.set(key, storedData)
  }

}
