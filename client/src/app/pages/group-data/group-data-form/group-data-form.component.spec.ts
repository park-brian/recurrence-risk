import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GroupDataFormComponent } from "./group-data-form.component";

describe("GroupDataFormComponent", () => {
  let component: GroupDataFormComponent;
  let fixture: ComponentFixture<GroupDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupDataFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
