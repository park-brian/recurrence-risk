import { TestBed } from "@angular/core/testing";

import { RecurrenceService } from "./recurrence.service";

describe("RecurrenceService", () => {
  let service: RecurrenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecurrenceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
