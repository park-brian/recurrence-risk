import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import {
  DataFrameHeader,
  FileService,
} from "src/app/services/file/file.service";
import { Row } from "src/app/components/table/table.component";
import { combineLatest } from "rxjs";

export type GroupDataParameters = {
  seerStatData: Row[];
  canSurvData: Row[];
  stageVariable: string;
  distantStageValue: number;
  adjustmentFactorR: number;
  followUpYears: number;
};

@Component({
  selector: "app-group-data-form",
  templateUrl: "./group-data-form.component.html",
  styleUrls: ["./group-data-form.component.scss"],
})
export class GroupDataFormComponent implements OnInit {
  @Output() submit = new EventEmitter<GroupDataParameters>();
  @Output() reset = new EventEmitter();
  form = new FormGroup({
    seerStatDictionaryFile: new FormControl(null, [Validators.required]),
    seerStatDataFile: new FormControl(null, [Validators.required]),
    canSurvDataFile: new FormControl(null, [Validators.required]),
    seerStatDictionary: new FormControl([], [Validators.required]),
    seerStatData: new FormControl([], [Validators.required]),
    canSurvData: new FormControl([], [Validators.required]),
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
  });

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.subscribe();
  }

  handleReset(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.form.reset({
      seerStatDictionaryFile: null,
      seerStatDataFile: null,
      canSurvDataFile: null,
      seerStatDictionary: null,
      seerStatData: [],
      canSurvData: [],
      stageVariable: "",
      distantStageValue: "",
      adjustmentFactorR: 1,
      followUpYears: 25,
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
      seerStatData,
      canSurvData,
      stageVariable,
      distantStageValue,
      adjustmentFactorR,
      followUpYears,
    } = this.form.value;

    this.submit.emit({
      seerStatData,
      canSurvData,
      stageVariable,
      distantStageValue,
      adjustmentFactorR,
      followUpYears,
    });

    return false;
  }

  subscribe() {
    const {
      seerStatDictionaryFile,
      seerStatDictionary,
      seerStatDataFile,
      seerStatData,
      canSurvDataFile,
      canSurvData,
      stageVariable,
      distantStageValue,
      followUpYears,
    } = this.form.controls;
    const isStageVariable = (name: string) => /stage/i.test(name);
    const isDistantStageValue = ({ label }: any) => /distant/i.test(label);

    // this.form.valueChanges.subscribe(console.log);

    // parse the cansurv data file once it becomes available
    canSurvDataFile?.valueChanges.subscribe(async (fileList: FileList) => {
      const csvFile = fileList && fileList[0];

      if (csvFile) {
        const { data } = await this.fileService.parseCsvFile(csvFile);
        canSurvData?.setValue(data);
      } else {
        canSurvData?.setValue([]);
      }
    });

    // parse both the seer*stat dictionary and data files at the same time
    combineLatest([
      seerStatDictionaryFile.valueChanges,
      seerStatDataFile.valueChanges,
    ]).subscribe(
      async ([dictionaryFileList, dataFileList]: [FileList, FileList]) => {
        const dictionaryFile = dictionaryFileList && dictionaryFileList[0];
        const dataFile = dataFileList && dataFileList[0];

        if (dictionaryFile && dataFile) {
          // parse SEER*Stat files to extract dictionary headers and data
          const { headers, config } =
            await this.fileService.parseSeerStatDictionary(dictionaryFile);
          const { data } = await this.fileService.parseSeerStatFiles(
            dictionaryFile,
            dataFile,
          );

          // determine the maximum number of followup years
          const sessionOptions = config["Session Options"];
          const numberOfIntervals = +sessionOptions?.NumberOfIntervals || 30;
          const monthsPerInterval = +sessionOptions?.MonthsPerInterval || 12;
          const maxFollowUpYears = Math.ceil(
            (monthsPerInterval * numberOfIntervals) / 12,
          );

          // determine the first stage variable which has a distant stage value
          const stageVariableMatch = headers.find(
            (header) =>
              isStageVariable(header.name) &&
              header.factors?.find(isDistantStageValue),
          );

          // set dependent form values
          this.form.patchValue({
            seerStatDictionary: headers,
            seerStatData: data,
            stageVariable: stageVariableMatch?.name || "",
            followUpYears: Math.min(25, maxFollowUpYears),
          });
        } else {
          // reset dependent form values if a SEER*Stat file is missing
          this.form.patchValue({
            seerStatDictionary: [],
            seerStatData: [],
            stageVariable: "",
            followUpYears: 25,
          });
        }

        seerStatDictionary?.markAsTouched();
        seerStatData?.markAsTouched();
        stageVariable?.markAsTouched();
        followUpYears?.markAsTouched();
      },
    );

    // update distant stage value whenever the stage variable changes
    stageVariable?.valueChanges.subscribe((value) => {
      const factors = this.getFactors(seerStatDictionary.value, value);
      const distantStageValueMatch = factors.find(isDistantStageValue);
      distantStageValue?.setValue(distantStageValueMatch?.value || "");
      distantStageValue?.markAsTouched();
    });
  }

  getFactors(headers: DataFrameHeader[], name: string) {
    return headers?.find((header) => header.name === name)?.factors || [];
  }
}
