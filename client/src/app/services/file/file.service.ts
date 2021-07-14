import { Injectable } from "@angular/core";
import { parseCsv, stringifyCsv, Record, CsvParseConfig, Value } from "./csv";
import { saveAs } from "file-saver";

export type DataFrameHeader = {
  name: string;
  factors?: {
    value: number | string | null;
    label: string;
  }[];
};

export type DataFrameRecord = {
  [key: string]: number | string | null;
};

export type DataFrame = {
  headers: DataFrameHeader[];
  data: DataFrameRecord[];
};

export type IniConfig = {
  [key: string]: {
    [key: string]: string;
  };
};

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor() {}

  readFile(
    file: File,
    type: "arrayBuffer" | "dataUrl" | "text" = "text",
  ): Promise<ArrayBuffer | string | null> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.onabort = () => reject(fileReader);

      switch (type) {
        case "text":
          return fileReader.readAsText(file);
        case "arrayBuffer":
          return fileReader.readAsArrayBuffer(file);
        case "dataUrl":
          return fileReader.readAsDataURL(file);
      }
    });
  }

  parseIni(
    contents: string,
    trimWhitespace: boolean = true,
    globalSection: string = "__global",
  ): IniConfig {
    let ini: any = {};
    let section: string = globalSection;
    const patterns = {
      eol: /\r?\n/g,
      comment: /^\s*;/, // ; comment
      section: /^\s*\[([^\]]*)\]/, // [section]
      keyValuePair: /^([^=]+)=(.*)$/, // key=value
    };

    for (const line of contents.split(patterns.eol)) {
      if (line.match(patterns.comment)) continue;

      const sectionMatch = line.match(patterns.section);
      if (sectionMatch !== null) {
        section = sectionMatch[1];
        if (trimWhitespace) {
          section = section.trim();
        }
        continue;
      }

      const keyValuePairMatch = line.match(patterns.keyValuePair);
      if (keyValuePairMatch !== null) {
        let [_, key, value] = keyValuePairMatch;
        if (trimWhitespace) {
          key = key.trim();
          value = value.trim();
        }

        ini[section] = {
          ...ini[section],
          [key]: value,
        };
      }
    }

    return ini;
  }

  /**
   * Formats a string as a valid R identifier
   * @param name
   * @returns
   */
  asValidName(name: string) {
    return name.replace(/[,:()<>={}!@#$%^&*+-]/g, "").replace(/\s+/g, "_");
  }

  /**
   * Parses a SEER*Stat dictionary file as a set of data frame headers
   * @param dictionaryFile
   * @returns
   */
  async parseSeerStatDictionary(
    dictionaryFile: File,
  ): Promise<{ headers: DataFrameHeader[]; config: IniConfig }> {
    const dictionaryFileContents = await this.readFile(dictionaryFile);
    const config = this.parseIni(dictionaryFileContents as string);

    // retrieve all columns and factors for each column (if applicable)
    const headers = Object.entries(config["Life Page Variables"])
      .filter(([key]) => /^Var(\d+)Name$/.test(key))
      .map(([key, value]) => ({
        name: this.asValidName(value),
        factors: Object.entries(config[`Format=${value}`] || {}).map(
          ([value, label]) => ({ value: Number(value), label }),
        ),
      }));

    return { headers, config };
  }

  /**
   * Parses a CSV file as a data frame
   * @param csvFile
   * @param options
   * @returns
   */
  async parseCsvFile(
    csvFile: File,
    options?: CsvParseConfig,
  ): Promise<DataFrame> {
    const fileContents = (await this.readFile(csvFile)) as string;
    const distinct: { [key: string]: Set<Value> } = {};
    const { headers, data } = parseCsv(fileContents, {
      transformRecord: (record) => {
        for (const key in record) {
          if (!distinct[key]) distinct[key] = new Set();
          const value = (record as Record)[key];
          distinct[key].add(value);
        }
        return record;
      },
      ...options,
    }) as {
      headers: string[];
      data: Record[];
    };

    return {
      data,
      headers: headers.map((name) => ({
        name,
        factors: Array.from(distinct[name])
          .sort()
          .map((value) => ({
            value,
            label: String(value),
          })),
      })),
    };
  }

  /**
   * Parses a SEER*Stat dictionary/data file pair as a data frame
   * @param seerStatDictionaryFile
   * @param seerStatDataFile
   * @returns
   */
  async parseSeerStatFiles(
    seerStatDictionaryFile: File,
    seerStatDataFile: File,
  ): Promise<DataFrame> {
    const { headers, config } = await this.parseSeerStatDictionary(
      seerStatDictionaryFile,
    );
    const dataFileContents = await this.readFile(seerStatDataFile);

    const options = config["Export Options"];
    const fieldDelimiter =
      {
        tab: "\t",
        comma: ",",
      }[options["Field delimiter"]] || ",";
    const missingCharacter =
      {
        period: ".",
      }[options["Missing character"]] || null;

    const { data } = parseCsv(dataFileContents as string, {
      headers: headers.map((h) => h.name),
      delimiter: fieldDelimiter,
      nullValue: missingCharacter,
    }) as { data: Record[] };

    return {
      headers,
      data,
    };
  }

  downloadCsv(data: Record[], filename: string) {
    const contents = stringifyCsv(data);
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
  }
}
