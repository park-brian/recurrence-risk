import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppRoutingModule } from "./router/app-routing.module";
import { AppComponent } from "./app.component";
import { GroupDataComponent } from "./pages/group-data/group-data.component";
import { IndividualDataComponent } from "./pages/individual-data/individual-data.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { TableComponent } from "./components/table/table.component";
import { FileValueAccessorDirective } from "./components/file-value-accessor/file-value-accessor.directive";
import { MultiselectComponent } from "./components/multiselect/multiselect.component";
import { GroupDataFormComponent } from "./pages/group-data/group-data-form/group-data-form.component";
import { GroupDataResultsComponent } from "./pages/group-data/group-data-results/group-data-results.component";
import { GroupDataHelpComponent } from "./pages/group-data/group-data-help/group-data-help.component";
import { SortableHeaderDirective } from "./components/table/sortable-header.directive";
import { IndividualDataFormComponent } from "./pages/individual-data/individual-data-form/individual-data-form.component";
import { IndividualDataHelpComponent } from "./pages/individual-data/individual-data-help/individual-data-help.component";
import { IndividualDataResultsComponent } from "./pages/individual-data/individual-data-results/individual-data-results.component";

@NgModule({
  declarations: [
    AppComponent,
    GroupDataComponent,
    IndividualDataComponent,
    NavbarComponent,
    TableComponent,
    MultiselectComponent,
    GroupDataFormComponent,
    GroupDataResultsComponent,
    GroupDataHelpComponent,
    FileValueAccessorDirective,
    SortableHeaderDirective,
    IndividualDataFormComponent,
    IndividualDataHelpComponent,
    IndividualDataResultsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
