import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerseIndexPage } from './verse-index.page';

const routes: Routes = [
  {
    path: '',
    component: VerseIndexPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerseIndexPageRoutingModule {}
