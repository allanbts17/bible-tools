import { TestBed } from '@angular/core/testing';

import { SharedInfoService } from './shared-info.service';

describe('SharedInfoService', () => {
  let service: SharedInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
