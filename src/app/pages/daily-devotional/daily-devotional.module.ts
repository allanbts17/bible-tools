import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DailyDevotionalPageRoutingModule } from './daily-devotional-routing.module';

import { DailyDevotionalPage } from './daily-devotional.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfiniteScrollModule,
    ComponentsModule,
    DailyDevotionalPageRoutingModule
  ],
  declarations: [DailyDevotionalPage]
})
export class DailyDevotionalPageModule {}
