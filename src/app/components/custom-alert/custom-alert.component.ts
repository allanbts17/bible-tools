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
            await this.storageService.removeItemByID('topics',top)
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
            //console.log(verse)
            await this.storageService.deleteVerse(verse)
            this.versesChangedEvent.emit()
          }
        }
      ]
    });
    await alert.present();
  }

  async noteDeleteConfirmationAlert(note){
    //console.log('confirm',cat)
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
            //await this.storageService.removeItemByID('notes',note)
            await this.storageService.deleteNote(note)
            this.notesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  categoryHaveNotes(cat){
    //Object.keys(this.notes)
    //Object.keys(this.notes).findIndex(noteCategory => noteCategory == cat.id) != -1
    return this.notes[cat.category].findIndex(note => note.category == cat.id) != -1
  }

  topicHaveVerses(top){
    //return this.verses.findIndex(verse => verse.topic == top.id) != -1
    return this.verses[top.name].findIndex(verse => verse.topic == top.id) != -1
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
      header: 'Moviendo notas',
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



  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Prompt!',
      inputs: [
        {
          name: 'name1',
          type: 'text',
          placeholder: 'Placeholder 1'
        },
        {
          name: 'name2',
          type: 'text',
          id: 'name2-id',
          value: 'hello',
          placeholder: 'Placeholder 2'
        },
        // multiline input.
        {
          name: 'paragraph',
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Placeholder 3'
        },
        {
          name: 'name3',
          value: 'http://ionicframework.com',
          type: 'url',
          placeholder: 'Favorite site ever'
        },
        // input date with min & max
        {
          name: 'name4',
          type: 'date',
          min: '2017-03-01',
          max: '2018-01-12'
        },
        // input date without min nor max
        {
          name: 'name5',
          type: 'date'
        },
        {
          name: 'name6',
          type: 'number',
          min: -5,
          max: 10
        },
        {
          name: 'name7',
          type: 'number'
        },
        {
          name: 'name8',
          type: 'password',
          placeholder: 'Advanced Attributes',
          cssClass: 'specialClass',
          attributes: {
            maxlength: 4,
            inputmode: 'decimal'
          }
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
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertRadio() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Radio',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Radio 1',
          value: 'value1',
          handler: () => {
            console.log('Radio 1 selected');
          },
          checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'Radio 2',
          value: 'value2',
          handler: () => {
            console.log('Radio 2 selected');
          }
        },
        {
          name: 'radio3',
          type: 'radio',
          label: 'Radio 3',
          value: 'value3',
          handler: () => {
            console.log('Radio 3 selected');
          }
        },
        {
          name: 'radio4',
          type: 'radio',
          label: 'Radio 4',
          value: 'value4',
          handler: () => {
            console.log('Radio 4 selected');
          }
        },
        {
          name: 'radio5',
          type: 'radio',
          label: 'Radio 5',
          value: 'value5',
          handler: () => {
            console.log('Radio 5 selected');
          }
        },
        {
          name: 'radio6',
          type: 'radio',
          label: 'Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 Radio 6 ',
          value: 'value6',
          handler: () => {
            console.log('Radio 6 selected');
          }
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
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertCheckbox() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Checkbox',
      inputs: [
        {
          name: 'checkbox1',
          type: 'checkbox',
          label: 'Checkbox 1',
          value: 'value1',
          handler: () => {
            console.log('Checkbox 1 selected');
          },
          checked: true
        },

        {
          name: 'checkbox2',
          type: 'checkbox',
          label: 'Checkbox 2',
          value: 'value2',
          handler: () => {
            console.log('Checkbox 2 selected');
          }
        },

        {
          name: 'checkbox3',
          type: 'checkbox',
          label: 'Checkbox 3',
          value: 'value3',
          handler: () => {
            console.log('Checkbox 3 selected');
          }
        },

        {
          name: 'checkbox4',
          type: 'checkbox',
          label: 'Checkbox 4',
          value: 'value4',
          handler: () => {
            console.log('Checkbox 4 selected');
          }
        },

        {
          name: 'checkbox5',
          type: 'checkbox',
          label: 'Checkbox 5',
          value: 'value5',
          handler: () => {
            console.log('Checkbox 5 selected');
          }
        },

        {
          name: 'checkbox6',
          type: 'checkbox',
          label: 'Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6',
          value: 'value6',
          handler: () => {
            console.log('Checkbox 6 selected');
          }
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
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }
}
