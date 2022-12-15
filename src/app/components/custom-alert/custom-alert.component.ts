import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Category } from 'src/app/interfaces/category';
import { Note } from 'src/app/interfaces/note';
import { Topic } from 'src/app/interfaces/topic';
import { Verse } from 'src/app/interfaces/verse';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
})
export class CustomAlertComponent implements OnInit {
  @Input() notes
  @Input() categories: Category[]
  @Input() verses //verses: Verse[]
  @Input() topics: Topic[]
  @Output() categoryErasedEvent = new EventEmitter<any>()
  @Output() notesChangedEvent = new EventEmitter<any>()
  @Output() topicErasedEvent = new EventEmitter<any>()
  @Output() versesChangedEvent = new EventEmitter<any>()
  @Output() topicAddedEvent = new EventEmitter<any>()
  newCatToMove
  newTopToMove

  constructor(public alertController: AlertController,public storageService: StorageService) {}

  ngOnInit() {}
  async deleteCategoryAlert(cat){
    //console.log(cat)
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Eliminando '+cat.category,
      message: '¿Que desea hacer con las notas de '+cat.category+'?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {}
        }, {
          text: 'Mover a otra categoría',
          id: 'confirm-button',
          handler: () => {
            this.moveNotesAlert(cat)
          }
        }, {
          text: 'Eliminarlas',
          id: 'confirm-button',
          handler: async () => {
            await this.deleteNotes(cat)
            await this.storageService.deleteCategory(cat)
            this.categoryErasedEvent.emit()
            this.notesChangedEvent.emit()
          }
        }
      ]
    });
    if(this.categoryHaveNotes(cat)){
      await alert.present();
    } else {
      this.categoryDeleteConfirmationAlert(cat)
    }

  }

  async deleteTopicAlert(top: Topic){
    //console.log(cat)
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Eliminando '+top.name,
      message: '¿Que desea hacer con los versículos del tema: "'+top.name+'"?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {}
        }, {
          text: 'Asignar otro tema',
          id: 'confirm-button',
          handler: () => {
            this.moveVerseAlert(top)
          }
        }, {
          text: 'Eliminarlas',
          id: 'confirm-button',
          handler: async () => {
            await this.deleteVerses(top)
            await this.storageService.deleteTopic(top)//.removeItemByID('topics',top)
            this.topicErasedEvent.emit()
            this.versesChangedEvent.emit()
          }
        }
      ]
    });
    if(this.topicHaveVerses(top)){
      await alert.present();
    } else {
      this.topicDeleteConfirmationAlert(top)
    }
  }

  async topicDeleteConfirmationAlert(top){
    //console.log('confirm',cat)
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmación',
      message: 'Está seguro que desea eliminar '+top.name+'?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {}
        }, {
          text: 'Eliminar',
          id: 'confirm-button',
          handler: async () => {
            await this.storageService.deleteTopic(top)
            this.topicErasedEvent.emit()
            this.versesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  async categoryDeleteConfirmationAlert(cat){
    //console.log('confirm',cat)
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmación',
      message: 'Está seguro que desea eliminar '+cat.category+'?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {}
        }, {
          text: 'Eliminar',
          id: 'confirm-button',
          handler: async () => {
            await this.storageService.deleteCategory(cat)
            this.categoryErasedEvent.emit()
            this.notesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  async verseDeleteConfirmationAlert(verse: Verse){
    //console.log('confirm',cat)
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmación',
      message: 'Está seguro que desea eliminar '+verse.passage.reference+'?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {}
        }, {
          text: 'Eliminar',
          id: 'confirm-button',
          handler: async () => {
            await this.storageService.deleteVerse(verse)
            this.versesChangedEvent.emit()
          }
        }
      ]
    });
    await alert.present();
  }

  async noteDeleteConfirmationAlert(note){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmación',
      message: 'Está seguro que desea eliminar '+note.title+'?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {}
        }, {
          text: 'Eliminar',
          id: 'confirm-button',
          handler: async () => {
            console.log(note)
            await this.storageService.deleteNote(note)
            this.notesChangedEvent.emit()
          }
        }
      ]
    });
    await alert.present();
  }

  categoryHaveNotes(cat){
    return this.notes[cat.category].findIndex(note => note.category == cat.id) != -1
  }

  topicHaveVerses(top){
    return this.verses[top.name].findIndex(verse => verse.topic == top.id) != -1
  }

  async changeVerseTopicAlert(verse: Verse){
    var radios = []
    var newTopics = this.topics.slice()
    let actualTopic = newTopics.find(topic => topic.id == verse.topic)
    delete newTopics[newTopics.findIndex(topic => topic.id == verse.topic)]
    newTopics.forEach(newTop=> radios.push({
        name: newTop.id,
        type: 'radio',
        label: newTop.name,
        value: newTop,
        handler: (val) => {
          this.newTopToMove = val.value
          console.log(val.value)
        },
        checked: false
    }))
    radios.push({
      name: 'new',
      type: 'radio',
      label: 'Nuevo tópico',
      value: 'addNewTopic',
      handler: (val) => {
        this.newTopToMove = val.value
        console.log(val.value)
      },
      checked: false
  })
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cambiando el tópico',
      message: '¿A cuál tópico desear cambiar?',
      inputs: radios,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Mover',
          handler: async () => {
            if(this.newTopToMove === 'addNewTopic'){
              this.addNewTopicAlert(verse,actualTopic)
            } else {
              await this.moveOneVerse(verse,actualTopic)
              this.versesChangedEvent.emit()
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addNewTopicAlert(verse: Verse,actualTopic) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Nuevo tópico',
      message: 'Escriba el nombre del nuevo tópico',
      inputs: [
        {
          name: 'newTopic',
          type: 'text',
          placeholder: 'Escribir nombre'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: async (value) => {
            let topic = {name: value.newTopic}
            let newArray = await this.storageService.addTopic(topic)
            this.newTopToMove = newArray.slice(-1)[0]

            setTimeout(async ()=> {
              await this.moveOneVerse(verse,actualTopic)
              this.topicAddedEvent.emit()
              this.versesChangedEvent.emit()
            //console.log('Confirm Ok',this.newTopToMove);
            })
          }
        }
      ]
    });

    await alert.present();
  }

  async addTopic(topic: Topic){
  }

  async moveOneVerse(verse: Verse,prevTopic){
    verse.topic = this.newTopToMove.id
    console.log('verse with new id',verse)
    await this.storageService.editVerse(verse,prevTopic.name)
  }


  async moveVerseAlert(top){
    var radios = []
    var newTopics = this.topics.slice()
    delete newTopics[newTopics.findIndex(topic => topic.id == top.id)]
    newTopics.forEach(newTop=> radios.push({
        name: newTop.id,
        type: 'radio',
        label: newTop.name,
        value: newTop,
        handler: (val) => {
          this.newTopToMove = val.value
          console.log(val.value)
        },
        checked: false
    }))
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Moviendo versículos',
      message: '¿A donde desea mover los versículos?',
      inputs: radios,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Mover',
          handler: async () => {
            await this.moveVerses(top)
            await this.storageService.deleteTopic(top)
            this.topicErasedEvent.emit()
            this.versesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  async moveNotesAlert(cat){
    var radios = []
    var newCategories = this.categories.slice()
    delete newCategories[newCategories.findIndex(category => category.id == cat.id)]
    newCategories.forEach(newCat=> radios.push({
        name: newCat.id,
        type: 'radio',
        label: newCat.category,
        value: newCat,
        handler: (val) => {
          this.newCatToMove = val.value
          console.log(val.value)
        },
        checked: false
    }))
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Moviendo notas',
      message: '¿A donde desea mover las notas?',
      inputs: radios,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Mover',
          handler: async () => {
            await this.moveNotes(cat)
            await this.storageService.deleteCategory(cat)
            this.categoryErasedEvent.emit()
            this.notesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  async moveNotes(prevCat){
    var filteredNotes = this.notes[prevCat.category]//.filter(note => note.category == prevCat.id)
    for(let i=0;i<filteredNotes.length;i++){
      filteredNotes[i].category = this.newCatToMove.id
      await this.storageService.editNote(filteredNotes[i],prevCat.category)
    }
  }

  async moveVerses(prevTop){
    console.log('jaja',prevTop)
    //var filteredVerses = this.verses.filter(verse => verse.topic == prevTop.id)
    var filteredVerses = this.verses[prevTop.name]//.filter(verse => verse.topic == prevTop.id)
    for(let i=0;i<filteredVerses.length;i++){
      filteredVerses[i].topic = this.newTopToMove.id
      await this.storageService.editVerse(filteredVerses[i],prevTop.name)
    }
  }


  async deleteNotes(prevCat){
    var filteredNotes = this.notes[prevCat.category]//.filter(note => note.category == prevCat.id)
    for(let i=0;i<filteredNotes.length;i++){
      await this.storageService.deleteNote(filteredNotes[i])
    }
  }

  async deleteVerses(prevTop){
    var filteredVerses = this.verses[prevTop.name]//.filter(verse => verse.topic == prevTop.id)
    for(let i=0;i<filteredVerses.length;i++){
      await this.storageService.deleteVerse(filteredVerses[i])
    }
  }

}
