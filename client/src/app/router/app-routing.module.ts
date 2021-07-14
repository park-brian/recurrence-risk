import { NgModule } from "@angular/core";
import { RouterModule, Routes, RouteReuseStrategy } from "@angular/router";
import { GroupDataComponent } from "../pages/group-data/group-data.component";
import { IndividualDataComponent } from "../pages/individual-data/individual-data.component";
import { CustomReuseStrategy } from "./custom-reuse-strategy";

const routes: Routes = [
  { path: "group-data", component: GroupDataComponent },
  { path: "individual-data", component: IndividualDataComponent },
  { path: "**", redirectTo: "group-data" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  providers: [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  exports: [RouterModule],
})
export class AppRoutingModule {}
