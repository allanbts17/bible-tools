import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonSegment } from '@ionic/angular';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  @Input() tabs
  @Input() selectedTab
  @Output() selectedTabEvent = new EventEmitter<any>()
  @ViewChild('segment') segment: IonSegment;
  checked
  tabTouched = false


  constructor() { }

  ngOnInit() {}

  moveTabs(previousIndex,currentIndex,tab){
    this.segment.value = tab
    console.log(previousIndex,currentIndex,this.selectedTab)
    if(!this.tabTouched){
      this.scrollTabs(currentIndex)
      this.checkButton(previousIndex,currentIndex)
    }
    this.tabTouched = false
  }

  scrollTabs(index){
    setTimeout(()=>{
      var buttons = document.getElementsByTagName('ion-segment-button')
      let rect = buttons[index].getBoundingClientRect()
      let windowWidth = window.innerWidth
      if((rect.x+rect.width) > windowWidth || rect.x < 0){
        buttons[index].scrollIntoView({
          behavior: 'smooth'
        })
      }
    })
  }

  tabSelected(tab,index){

    this.tabTouched = true
    this.selectedTab = tab
    this.selectedTabEvent.emit({
      tab: tab,
      index: index
    })
    /*setTimeout(()=>{
      let ind = 0
        const buttons = this.getButtons();
        console.log('\n\n\n')
        buttons.forEach(button => {
          let list = Array.from(button.classList)
          let chk = list.includes('segment-button-after-checked')? 'after-checked':''
          let afChk = list.includes('segment-button-checked')? 'checked':''
          console.log(this.tabs[ind],chk,afChk)
          ind++
        })
    },5000)*/

  }

  getIndicator(button) {
    const root = button.shadowRoot || button;
    return root.querySelector('.segment-button-indicator');
  }

  checkButton(previousIndex, currentnIndex) {
    let segmentButtons = this.getButtons()
    let previous = segmentButtons[previousIndex]
    let current = segmentButtons[currentnIndex]
    const previousIndicator = this.getIndicator(previous);
    const currentIndicator = this.getIndicator(current);
    if (previousIndicator === null || currentIndicator === null) {
      return;
    }
    const previousClientRect = previousIndicator.getBoundingClientRect();
    const currentClientRect = currentIndicator.getBoundingClientRect();
    const widthDelta = previousClientRect.width / currentClientRect.width;
    const xPosition = previousClientRect.left - currentClientRect.left;
    // Scale the indicator width to match the previous indicator width
    // and translate it on top of the previous indicator
    const transform = `translate3d(${xPosition}px, 0, 0) scaleX(${widthDelta})`;
   // writeTask(() => {
      // Remove the transition before positioning on top of the previous indicator
    currentIndicator.classList.remove('segment-button-indicator-animated');
    currentIndicator.style.setProperty('transform', transform);
    // Force a repaint to ensure the transform happens
    currentIndicator.getBoundingClientRect();
    // Add the transition to move the indicator into place
    currentIndicator.classList.add('segment-button-indicator-animated');
    // Remove the transform to slide the indicator back to the button clicked
    currentIndicator.style.setProperty('transform', '');
   // });
    //this.value = current.value;
    this.setCheckedClasses();
  }
  setCheckedClasses() {
    const buttons = this.getButtons();
    const index = buttons.findIndex((button) => button.value === this.selectedTab);
    const next = index + 1;

    // Keep track of the currently checked button
    this.checked = buttons.find((button) => button.value === this.selectedTab);
    for (const button of buttons) {
      button.classList.remove('segment-button-after-checked','segment-button-checked');
    }
    buttons[index].classList.add('segment-button-checked');
    if (next < buttons.length) {
      buttons[next].classList.add('segment-button-after-checked');
    }
    let ind = 0
    console.log('\n\n\n')
    buttons.forEach(button => {
      let list = Array.from(button.classList)
      let chk = list.includes('segment-button-after-checked')? 'after-checked':''
      let afChk = list.includes('segment-button-checked')? 'checked':''
      console.log(this.tabs[ind],chk,afChk)
      ind++
    })
    //console.log(buttons)
  }

  getButtons() {
    let con = document.getElementById('daily-div')
    return Array.from(con.querySelectorAll('ion-segment-button'));
  }

}
