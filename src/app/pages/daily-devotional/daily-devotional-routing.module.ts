import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DailyDevotionalPage } from './daily-devotional.page';

const routes: Routes = [
  {
    path: '',
    component: DailyDevotionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyDevotionalPageRoutingModule {}
