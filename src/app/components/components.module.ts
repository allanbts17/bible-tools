import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddNoteModalComponent } from './add-note-modal/add-note-modal.component';
import { GeneralNoteComponent } from './general-note/general-note.component';
import { AddCategoryComponent } from './add-category/add-category.component';
import { CustomAlertComponent } from './custom-alert/custom-alert.component';

const components = [ColorPickerComponent,AddNoteModalComponent,GeneralNoteComponent,
AddCategoryComponent,CustomAlertComponent]

@NgModule({
  declarations: [components],
  exports: [components],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class ComponentsModule { }
