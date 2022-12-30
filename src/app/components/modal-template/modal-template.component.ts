import { Component, Input, OnInit, Output, ViewChild,EventEmitter } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonModal } from '@ionic/angular';
import { Colors } from 'src/app/classes/utils';

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
})
export class ModalTemplateComponent implements OnInit {
  @ViewChild('modal') modal: IonModal;
  @Input() title
  @Output() modalDidPresent = new EventEmitter<any>()
  constructor() { }

  ngOnInit() {}

  willDismiss(){
    StatusBar.setBackgroundColor({color: Colors.statusBarLightMode})
    StatusBar.setStyle({style: Style.Light})
    console.log('destroyed');
  }

  willPresent(){
    StatusBar.setBackgroundColor({color: Colors.statusBarModalDarkMode})
    StatusBar.setStyle({style: Style.Dark})
    console.log('init');
  }

  didPresent(){
    this.modalDidPresent.emit()
  }

  present(){
    console.log('title',this.title);

    this.modal.present()
  }

  dismiss(){
    this.modal.dismiss()
  }

}
