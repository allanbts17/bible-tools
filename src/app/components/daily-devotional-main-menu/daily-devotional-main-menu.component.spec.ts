import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DailyDevotionalMainMenuComponent } from './daily-devotional-main-menu.component';

describe('DailyDevotionalMainMenuComponent', () => {
  let component: DailyDevotionalMainMenuComponent;
  let fixture: ComponentFixture<DailyDevotionalMainMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyDevotionalMainMenuComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyDevotionalMainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
