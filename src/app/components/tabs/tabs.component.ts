import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild } from '@angular/core';
import { IonSegment, IonSegmentButton } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config.service';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  @Input() tabs
  @Output() selectedTabEvent = new EventEmitter<any>()
  @ViewChild('segment') segment: IonSegment;
  checked
  tabTouched = false
  selectIndex = 0
  start = false

  constructor(public config: ConfigService) { }

  ngOnInit() {}

  scrollTabs(index){
    setTimeout(()=>{
      var buttons = document.getElementsByTagName('ion-segment-button')
      let rect = buttons[index].getBoundingClientRect()
      let windowWidth = window.innerWidth
      let scrollableSegment = document.getElementById('tab-segment')
      if((rect.x+rect.width) > windowWidth){
        let move = rect.x+rect.width - windowWidth
        scrollableSegment.scrollBy(move,0)
      } else if(rect.x < 0){
        scrollableSegment.scrollBy(rect.x,0)
      }
    })
  }

  tabSelected(tab,index,parentsTabSelected = false){
    let buttons = this.getButtons()
    let buttonClientRect = buttons[index].getBoundingClientRect()
    let firstButtonX = buttons[0].getBoundingClientRect().x
    let customIndicator = document.getElementById('custom-indicator')

    if(!this.start){
      let segmentEl =  document.getElementById('tab-segment')
      let firstButtonWidth = buttons[0].getBoundingClientRect().width
      customIndicator.style.width = `${firstButtonWidth}px`
      customIndicator.style.left = `${firstButtonX}px`
      segmentEl.classList.add('indicator-hided')
      customIndicator.classList.add('animate')
      this.start = true
    }

    setTimeout(()=>{
      customIndicator.style.width = `${buttonClientRect.width}px`
      customIndicator.style.left = `${buttonClientRect.x-firstButtonX}px`
      this.scrollTabs(index)
    })

    if(!parentsTabSelected){
      this.selectedTabEvent.emit({
        tab: tab,
        index: index
      })
    }
    this.selectIndex = index
  }

  getButtons() {
    let con = document.getElementById('daily-div')
    return Array.from(con.querySelectorAll('ion-segment-button'));
  }

}
