import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IndividualDataComponent } from "./individual-data.component";

describe("IndividualDataComponent", () => {
  let component: IndividualDataComponent;
  let fixture: ComponentFixture<IndividualDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualDataComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
