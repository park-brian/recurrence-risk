import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GroupDataHelpComponent } from "./group-data-help.component";

describe("GroupDataHelpComponent", () => {
  let component: GroupDataHelpComponent;
  let fixture: ComponentFixture<GroupDataHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupDataHelpComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
