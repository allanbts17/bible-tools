import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
})
export class CustomAlertComponent implements OnInit {
  @Input() notes
  @Input() categories
  @Output() categoryErasedEvent = new EventEmitter<any>()
  @Output() notesChangedEvent = new EventEmitter<any>()
  newCatToMove = 0

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
            await this.storageService.removeItemByID('categories',cat.id)
            this.categoryErasedEvent.emit()
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
            await this.storageService.removeItemByID('categories',cat.id)
            this.categoryErasedEvent.emit()
            this.notesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  categoryHaveNotes(cat){
    return this.notes.findIndex(note => note.category == cat.id) != -1
  }

  async moveNotesAlert(cat){
    var radios = []
    var newCategories = this.categories.slice()
    delete newCategories[newCategories.findIndex(category => category.id == cat.id)]
    newCategories.forEach(newCat=> radios.push({
        name: newCat.id,
        type: 'radio',
        label: newCat.category,
        value: newCat.id,
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
            await this.storageService.removeItemByID('categories',cat.id)
            this.categoryErasedEvent.emit()
            this.notesChangedEvent.emit()
          }
        }
      ]
    });

    await alert.present();
  }

  async moveNotes(prevCat){
    var filteredNotes = this.notes.filter(note => note.category == prevCat.id)
    for(let i=0;i<filteredNotes.length;i++){
      filteredNotes[i].category = this.newCatToMove
      await this.storageService.editItemByID('notes',filteredNotes[i])
    }
  }

  async deleteNotes(prevCat){
    var filteredNotes = this.notes.filter(note => note.category == prevCat.id)
    for(let i=0;i<filteredNotes.length;i++){
      await this.storageService.removeItemByID('notes',filteredNotes[i])
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
