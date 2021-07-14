import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IndividualDataFormComponent } from "./individual-data-form.component";

describe("IndividualDataFormComponent", () => {
  let component: IndividualDataFormComponent;
  let fixture: ComponentFixture<IndividualDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndividualDataFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
