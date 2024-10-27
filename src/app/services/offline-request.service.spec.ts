import { TestBed } from '@angular/core/testing';

import { OfflineRequestService } from './offline-request.service';

describe('OfflineRequestService', () => {
  let service: OfflineRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
