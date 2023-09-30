import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { BibleStudyPage } from './bible-study.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { BibleStudyPageRoutingModule } from './bible-study-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    BibleStudyPageRoutingModule
  ],
  declarations: [BibleStudyPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BibleStudyPageModule {}
