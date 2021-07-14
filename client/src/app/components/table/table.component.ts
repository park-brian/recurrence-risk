import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FileService } from "src/app/services/file/file.service";
import {
  SortableHeaderDirective,
  SortEvent,
} from "./sortable-header.directive";

export type Value = number | string | null;

export type ValueFormatter = (value: Value) => Value;

export type Row = {
  [key: string]: Value;
};

export type Header = {
  key: string;
  title: string;
  valueFormatter?: ValueFormatter;
};

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit, OnChanges {
  @ViewChildren(SortableHeaderDirective)
  sortableHeaders?: QueryList<SortableHeaderDirective>;

  @Input() headers: Header[] = [];
  @Input() data: any[] = [];
  @Input() placeholder: string = "No Data";
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Input() defaultValueFormatter: ValueFormatter = (value) => {
    if (value === null || value === undefined) return "";
    else if (!isNaN(value as number)) return Number((+value).toFixed(9));
    else return String(value);
  };

  activeData: any[] = [];
  readonly defaultFilter: (value: any[]) => any[] = (v) => v;
  searchFilter: (value: any[]) => any[] = this.defaultFilter;
  sortFilter: (value: any[]) => any[] = this.defaultFilter;
  searchControl: FormControl = new FormControl("");
  pageSizeControl: FormControl = new FormControl(this.pageSize);
  math = Math;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      value = value.trim().toLocaleLowerCase();
      this.searchFilter = !value.length
        ? this.defaultFilter
        : (data: Row[]) =>
            data.filter((record) =>
              Object.values(record)
                .map((v) =>
                  String(this.defaultValueFormatter(v)).toLocaleLowerCase(),
                )
                .find((v) => v.includes(value)),
            );
      this.applyFilters();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.activeData = this.data;
    this.searchControl.setValue("");
    this.pageSizeControl.setValue(this.pageSize);
    this.page = 1;
  }

  onSort({ column, direction }: SortEvent) {
    // reset other headers (no multisort yet)
    this.sortableHeaders?.forEach((header) => {
      if (header.column !== column) {
        header.direction = "";
      }
    });

    if (direction === "" || column === "") {
      this.sortFilter = this.defaultFilter;
    } else {
      this.sortFilter = (data) =>
        data.sort((a, b) => {
          const comparison = this.compare(a[column], b[column]);
          return direction === "asc" ? comparison : -comparison;
        });
    }
    this.applyFilters();
  }

  applyFilters() {
    this.page = 1;
    this.activeData = [this.searchFilter, this.sortFilter].reduce(
      (data, filter) => filter(data),
      [...this.data],
    );
  }

  compare(a: any, b: any) {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    } else {
      return String(a).localeCompare(String(b));
    }
  }

  download(filename: string = "export.csv") {
    if (this.data.length) {
      const data = this.activeData.length ? this.activeData : this.data;
      this.fileService.downloadCsv(data, filename);
    }
  }
}
