import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonModal } from '@ionic/angular';
import { Colors, makeId } from 'src/app/classes/utils';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
})
export class ModalTemplateComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Input() title
  @Output() modalDidPresent = new EventEmitter<any>()
  @Output() closedEvent = new EventEmitter<any>()
  @Input() toolbarColor: string = '#1D71B8'
  constructor(private config: ConfigService) { 
  }

  ngOnInit() { 
    
  }

  willDismiss() {
    try {
      if (this.config.settings.darkMode) {
        StatusBar.setBackgroundColor({ color: Colors.statusBarDarkMode })
        StatusBar.setStyle({ style: Style.Dark })
      } else {
        StatusBar.setBackgroundColor({ color: Colors.statusBarLightMode })
        StatusBar.setStyle({ style: Style.Light })
      }
      //console.log('destroyed');
    } catch (err) {
      console.log(err?.code);
    }
  }

  willPresent() {
    try {
      if (this.config.settings.darkMode) {
        StatusBar.setBackgroundColor({ color: Colors.statusBarModalDarkMode })
        StatusBar.setStyle({ style: Style.Dark })
      } else {
        StatusBar.setBackgroundColor({ color: Colors.statusBarModalLightMode })
        StatusBar.setStyle({ style: Style.Dark })
      }
      //console.log('init');
    } catch (err) {
      console.log(err?.code);
    }
  }

  didPresent() {
    this.modalDidPresent.emit()
  }

  present() {
    this.modal.present()
  }

  dismiss() {
    this.closedEvent.emit()
    this.modal.dismiss()
  }

}
