import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerseIndexPageRoutingModule } from './verse-index-routing.module';

import { VerseIndexPage } from './verse-index.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    VerseIndexPageRoutingModule
  ],
  declarations: [VerseIndexPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VerseIndexPageModule {}
