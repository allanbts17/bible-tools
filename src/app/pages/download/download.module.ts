import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerseIndexPageRoutingModule } from './download-routing.module';

import { ComponentsModule } from 'src/app/components/components.module';
import { DownloadPage } from './download.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    VerseIndexPageRoutingModule
  ],
  declarations: [DownloadPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DownloadPageModule {}
