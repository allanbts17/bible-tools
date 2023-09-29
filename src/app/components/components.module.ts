import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddNoteModalComponent } from './add-note-modal/add-note-modal.component';
import { GeneralNoteComponent } from './general-note/general-note.component';
import { AddCategoryComponent } from './add-category/add-category.component';
import { CustomAlertComponent } from './custom-alert/custom-alert.component';
import { SelectBibleModalComponent } from './select-bible-modal/select-bible-modal.component';
import { SelectPassageModalComponent } from './select-passage-modal/select-passage-modal.component';
// import { SwiperModule } from 'swiper/angular';
// import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { IonicSlides } from '@ionic/angular';
import { NoteSelectionSheetComponent } from './note-selection-sheet/note-selection-sheet.component';
import { DailyDevotionalMainMenuComponent } from './daily-devotional-main-menu/daily-devotional-main-menu.component';
import { AddVerseModalComponent } from './add-verse-modal/add-verse-modal.component';
import { TopicModalComponent } from './topic-modal/topic-modal.component';
import { TabsComponent } from './tabs/tabs.component';
import { ModalTemplateComponent } from './modal-template/modal-template.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

const components = [ColorPickerComponent,AddNoteModalComponent,GeneralNoteComponent,
AddCategoryComponent,CustomAlertComponent,SelectBibleModalComponent,SelectPassageModalComponent,
NoteSelectionSheetComponent,DailyDevotionalMainMenuComponent,AddVerseModalComponent,
TopicModalComponent,TabsComponent,ModalTemplateComponent]

//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides]);

@NgModule({
  declarations: [components],
  exports: [components],
  imports: [
    CommonModule,
    FormsModule,
    //BrowserAnimationsModule,
    NgxSpinnerModule,
   // SwiperModule,
    IonicModule
  ]
})
export class ComponentsModule { }
