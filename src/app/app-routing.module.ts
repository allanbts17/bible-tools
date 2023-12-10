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
  },
  {
    path: 'daily-devotional',
    loadChildren: () => import('./pages/daily-devotional/daily-devotional.module').then( m => m.DailyDevotionalPageModule)
  },
  {
    path: 'verse-index',
    loadChildren: () => import('./pages/verse-index/verse-index.module').then( m => m.VerseIndexPageModule)
  },
  {
    path: 'download',
    loadChildren: () => import('./pages/download/download.module').then( m => m.DownloadPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
