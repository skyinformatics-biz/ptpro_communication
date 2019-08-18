import { TestBed } from '@angular/core/testing';

import { ChatwindowsService } from './chatwindows.service';

describe('ChatwindowsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatwindowsService = TestBed.get(ChatwindowsService);
    expect(service).toBeTruthy();
  });
});
