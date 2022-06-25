import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

const components = [ColorPickerComponent]

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
