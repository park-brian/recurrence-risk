import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IndividualDataResultsComponent } from "./individual-data-results.component";

describe("IndividualDataResultsComponent", () => {
  let component: IndividualDataResultsComponent;
  let fixture: ComponentFixture<IndividualDataResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualDataResultsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualDataResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
