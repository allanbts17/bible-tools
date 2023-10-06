import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DailyDevotionalPageRoutingModule } from './daily-devotional-routing.module';

import { DailyDevotionalPage } from './daily-devotional.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    DailyDevotionalPageRoutingModule
  ],
  declarations: [DailyDevotionalPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DailyDevotionalPageModule {}
