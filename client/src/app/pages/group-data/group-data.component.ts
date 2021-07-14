import { Component, OnInit } from "@angular/core";
import { Row } from "src/app/components/table/table.component";
import { RecurrenceService } from "src/app/services/recurrence/recurrence.service";

@Component({
  selector: "app-group-data",
  templateUrl: "./group-data.component.html",
  styleUrls: ["./group-data.component.scss"],
})
export class GroupDataComponent implements OnInit {
  results: Row[] = [];
  error: any = null;
  loading: boolean = false;

  constructor(private recurrenceRiskService: RecurrenceService) {}

  ngOnInit(): void {
    this.handleReset();
  }

  handleReset() {
    this.results = [];
    this.error = null;
    this.loading = false;
  }

  async handleSubmit(parameters: any) {
    try {
      this.error = null;
      this.loading = true;
      this.results = (await this.recurrenceRiskService
        .getRiskFromGroupData(parameters)
        .toPromise()) as any;
    } catch (e) {
      this.error = e;
      console.log(e);
    } finally {
      this.loading = false;
    }
  }
}
