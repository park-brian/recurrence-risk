import { Directive, Input, Output, EventEmitter } from "@angular/core";

export type SortDirection = "asc" | "desc" | "";

export interface SortEvent {
  column: string;
  direction: SortDirection;
}

@Directive({
  selector: "th[sortable]",
  host: {
    "[class.asc]": 'direction === "asc"',
    "[class.desc]": 'direction === "desc"',
    "(click)": "rotate()",
  },
})
export class SortableHeaderDirective {
  @Input() column: string = "";
  @Input() direction: SortDirection = "";
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = {
      "asc": "desc",
      "desc": "",
      "": "asc",
    }[this.direction] as SortDirection;
    this.sort.emit({
      column: this.column,
      direction: this.direction,
    });
  }
}
