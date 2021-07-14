import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IndividualDataHelpComponent } from "./individual-data-help.component";

describe("IndividualDataHelpComponent", () => {
  let component: IndividualDataHelpComponent;
  let fixture: ComponentFixture<IndividualDataHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualDataHelpComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
