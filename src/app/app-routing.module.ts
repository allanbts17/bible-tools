import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bible-study',
    pathMatch: 'full'
  },
  {
    path: 'bible-study',
    loadChildren: () => import('./pages/bible-study/bible-study.module').then( m => m.BibleStudyPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
