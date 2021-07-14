import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  @Input() links: { target: string; title: string }[] = [];

  collapse: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
