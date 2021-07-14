import { Component, OnInit, Input, SimpleChanges } from "@angular/core";
import { Header, Row } from "src/app/components/table/table.component";

@Component({
  selector: "app-individual-data-results",
  templateUrl: "./individual-data-results.component.html",
  styleUrls: ["./individual-data-results.component.scss"],
})
export class IndividualDataResultsComponent implements OnInit {
  readonly defaultHeaders: Header[] = [
    { key: "followup", title: "followup" },
    { key: "link", title: "link" },
    { key: "r", title: "r" },
    { key: "cure", title: "cure" },
    { key: "lambda", title: "lambda" },
    { key: "k", title: "k" },
    { key: "theta", title: "theta" },
    { key: "surv_curemodel", title: "surv_curemodel" },
    { key: "surv_notcure", title: "surv_notcure" },
    { key: "median_surv_notcured", title: "median_surv_notcured" },
    { key: "s1_numerical", title: "s1_numerical" },
    { key: "G_numerical", title: "G_numerical" },
    { key: "CI_numerical", title: "CI_numerical" },
    { key: "s1_analytical", title: "s1_analytical" },
    { key: "G_analytical", title: "G_analytical" },
    { key: "CI_analytical", title: "CI_analytical" },
    { key: "se_CI_analytical", title: "se_CI_analytical" },
    { key: "obs_surv", title: "obs_surv" },
    { key: "obs_dist_surv", title: "obs_dist_surv" },
  ];

  @Input() data: Row[] = [];
  headers: Header[] = this.defaultHeaders;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.data && this.data.length > 0) {
      this.headers = Object.keys(this.data[0]).map((name) => ({
        key: name,
        title: name,
      }));
    } else {
      this.headers = this.defaultHeaders;
    }
  }
}
