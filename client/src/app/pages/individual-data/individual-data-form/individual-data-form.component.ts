import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import {
  DataFrameHeader,
  FileService,
} from "src/app/services/file/file.service";
import { Row } from "src/app/components/table/table.component";
import { combineLatest, zip } from "rxjs";
import { SelectOption } from "src/app/components/multiselect/multiselect.component";

export type IndividualDataParameters = {
  individualData: Row[];
  individualDataFileName: string;
  strata: number[];
  covariates: number[];
  timeVariable: string;
  eventVariable: string;
  distribution: string;
  stageVariable: string;
  distantStageValue: number;
  adjustmentFactorR: number;
  followUpYears: number;
  queue: boolean;
  email: string;
};

@Component({
  selector: "app-individual-data-form",
  templateUrl: "./individual-data-form.component.html",
  styleUrls: ["./individual-data-form.component.scss"],
})
export class IndividualDataFormComponent implements OnInit {
  @Output() submit = new EventEmitter<IndividualDataParameters>();
  @Output() reset = new EventEmitter();
  form = new FormGroup({
    individualDataFile: new FormControl(null, [Validators.required]),
    individualDataFileName: new FormControl("", [Validators.required]),
    individualDataHeaders: new FormControl([], [Validators.required]),
    individualData: new FormControl([], [Validators.required]),
    strata: new FormControl([]),
    covariates: new FormControl([]),
    timeVariable: new FormControl("", [Validators.required]),
    eventVariable: new FormControl("", [Validators.required]),
    distribution: new FormControl("", [Validators.required]),
    stageVariable: new FormControl("", [Validators.required]),
    distantStageValue: new FormControl("", [Validators.required]),
    adjustmentFactorR: new FormControl(1, [
      Validators.required,
      Validators.min(0.5),
      Validators.max(2),
    ]),
    followUpYears: new FormControl(25, [
      Validators.required,
      Validators.min(1),
    ]),
    queue: new FormControl(false, []),
    email: new FormControl("", []),
  });
  headerControls: { [key: string]: string } = {};
  loading: boolean = false;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.subscribe();
  }

  handleReset(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.form.reset({
      individualDataFile: null,
      individualDataHeaders: [],
      individualData: [],
      strata: [],
      covariates: [],
      timeVariable: "",
      eventVariable: "",
      distribution: "",
      stageVariable: "",
      distantStageValue: "",
      adjustmentFactorR: 1,
      followUpYears: 25,
      queue: false,
      email: "",
    });

    this.reset.emit();

    return false;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return false;
    }

    const {
      individualData,
      individualDataFileName,
      strata,
      covariates,
      timeVariable,
      eventVariable,
      distribution,
      stageVariable,
      distantStageValue,
      adjustmentFactorR,
      followUpYears,
      queue,
      email,
    } = this.form.value;

    this.submit.emit({
      individualData,
      individualDataFileName,
      strata,
      covariates,
      timeVariable,
      eventVariable,
      distribution,
      stageVariable,
      distantStageValue,
      adjustmentFactorR,
      followUpYears,
      queue,
      email,
    });

    return false;
  }

  subscribe() {
    const {
      individualDataFile,
      individualDataFileName,
      individualDataHeaders,
      individualData,
      strata,
      covariates,
      timeVariable,
      eventVariable,
      email,
      queue,
      followUpYears,
    } = this.form.controls;

    this.form.valueChanges.subscribe((formValue) => {
      // ensure that queueing is enabled if required
      const shouldQueue = this.shouldQueue(formValue);
      if (shouldQueue && !queue.value) {
        // do not uncheck queue
        queue.setValue(true, { emitEvent: false });
      }

      // map headers to controls
      const controls = [
        "strata",
        "covariates",
        "timeVariable",
        "eventVariable",
      ];
      const headers = formValue.individualDataHeaders?.map(
        (header: DataFrameHeader) => header.name,
      );

      this.headerControls =
        headers?.reduce((headerControls: any, header: string) => {
          for (const controlName of controls) {
            if (formValue[controlName].includes(header)) {
              headerControls[header] = controlName;
            }
          }
          return headerControls;
        }, {}) || {};

      // console.log(formValue, this.headerControls);
    });

    timeVariable?.valueChanges.subscribe((name) => {
      const header: DataFrameHeader = individualDataHeaders.value?.find(
        (dataHeader: DataFrameHeader) => dataHeader.name === name,
      );

      if (header) {
        const maxFollowUpYears = header.factors
          ?.map((factor) => Number(factor.value))
          .reduce((max, value) => Math.max(max, value));

        followUpYears.setValue(Math.min(maxFollowUpYears || 25, 25));
      }
    });

    individualDataFile.valueChanges.subscribe(async (fileList: FileList) => {
      if (fileList && fileList.length > 0) {
        try {
          const file = fileList[0];
          const { data, headers } = await this.fileService.parseCsvFile(
            file,
          );

          this.form.patchValue({
            individualDataHeaders: headers,
            individualDataFileName: file.name,
            individualData: data,
            strata: [],
            covariates: [],
            timeVariable: "",
            eventVariable: "",
            distribution: "",
            stageVariable: "",
            distantStageValue: "",
            adjustmentFactorR: 1,
            followupYears: 25,
          });
        } catch (e) {
          console.log(e);
        } finally {
          this.loading = false;
        }
      } else {
        this.form.patchValue({
          individualDataHeaders: [],
          individualDataFileName: "",
          individualData: [],
          strata: [],
          covariates: [],
          timeVariable: "",
          eventVariable: "",
          distribution: "",
          stageVariable: "",
          distantStageValue: "",
          adjustmentFactorR: 1,
          followupYears: 25,
        });
      }
    });
  }

  isDisabled(headerName: string, formControlName: string) {
    return Boolean(
      this.headerControls[headerName] &&
        this.headerControls[headerName] !== formControlName,
    );
  }

  shouldQueue(formValue: any) {
    return formValue?.strata?.length > 2 || formValue?.covariates.length > 0;
  }

  getOptions(
    headers: DataFrameHeader[],
    formControlName: string,
  ): SelectOption[] {
    return headers.map((header) => ({
      value: header.name,
      label: header.name,
      disabled: this.isDisabled(header.name, formControlName),
    }));
  }

  getFactors(headers: DataFrameHeader[], name: string) {
    return headers?.find((header) => header.name === name)?.factors || [];
  }
}
