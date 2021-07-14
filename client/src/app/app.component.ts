import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  links = [
    { title: "Group Data", target: "/group-data" },
    { title: "Individual Data", target: "/individual-data" },
  ];

  constructor(public route: ActivatedRoute) {}
}
