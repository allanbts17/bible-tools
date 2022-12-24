import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import iro from '@jaames/iro'


@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
  @Output() selectColorEvent = new EventEmitter<string>()
  colorCode:string=""
  colorPicker

  constructor() { }

  ngOnInit() {
    let ref = this
    this.colorPicker = iro.ColorPicker("#picker",{width:window.innerWidth*0.6,color:"#fff"})
    this.colorPicker.on('color:change',function(color){
      ref.colorCode = color.hexString
      ref.selectColorEvent.emit(ref.colorCode)
    })
  }

  ngOnDestroy(){
    this.colorPicker.off('color:change',()=>{})
  }

}
