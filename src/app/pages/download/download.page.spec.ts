import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPage } from './download.page';

describe('DownloadPage', () => {
  let component: DownloadPage;
  let fixture: ComponentFixture<DownloadPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DownloadPage]
    });
    fixture = TestBed.createComponent(DownloadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
