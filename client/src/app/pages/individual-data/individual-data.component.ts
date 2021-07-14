import { Component, OnInit } from "@angular/core";
import { Row } from "src/app/components/table/table.component";
import { RecurrenceService } from "src/app/services/recurrence/recurrence.service";

@Component({
  selector: "app-individual-data",
  templateUrl: "./individual-data.component.html",
  styleUrls: ["./individual-data.component.scss"],
})
export class IndividualDataComponent implements OnInit {
  results: Row[] = [];
  error: any = null;
  loading: boolean = false;
  alerts: any[] = [];

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
      this.alerts = [];
      this.results = [];
      this.error = null;
      this.loading = true;
      console.log(parameters);
      const results = (await this.recurrenceRiskService
        .getRiskFromIndividualData(parameters)
        .toPromise()) as any;
      
      if (parameters.queue) {
        this.alerts.push({
          type: 'primary',
          message: 'Your calculation parameters have been enqueued.'
        })
      } else {
        this.results = results;
      }
      
    } catch (e) {
      this.error = e;
      this.alerts.push({
        type: 'danger',
        message: e
      })
      console.log(e);
    } finally {
      this.loading = false;
    }
  }

  closeAlert(index: number) {
    this.alerts.splice(index, 1);
  }
}
