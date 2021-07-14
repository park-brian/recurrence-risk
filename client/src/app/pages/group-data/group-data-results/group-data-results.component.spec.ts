import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GroupDataResultsComponent } from "./group-data-results.component";

describe("GroupDataResultsComponent", () => {
  let component: GroupDataResultsComponent;
  let fixture: ComponentFixture<GroupDataResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupDataResultsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDataResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
