import { Component } from '@angular/core';
import { ConfigService } from './services/config.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Bible', url: '/bible-study', icon: 'book' },
    { title: 'Daily devotional', url: '/daily-devotional', icon: 'document-text' },
    { title: 'Verse index', url: '/verse-index', icon: 'list' }
  ];
  header_title = ""
  header_subtitle = ""

  constructor(public config: ConfigService) {
    this.setText()
  }

  setText(){
    this.header_title = this.config.getData().menu.header
    this.header_subtitle = this.config.getData().menu.note
    for(let i=0;i<this.appPages.length;i++){
      this.appPages[i].title = this.config.getData().menu.items[i]
    }
  }
}
