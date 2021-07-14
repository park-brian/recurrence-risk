export type Value = number | string | null;

export type Record = {
  [key: string]: Value;
};

export type CsvParseConfig = {
  delimiter: string;
  escape: string;
  skipLines: number;
  headers: boolean | string[];
  nullValue?: any;
  transformHeaders: (headers: string[]) => string[];
  transformRecord: (record: Record | Value[]) => Record | Value[];
  transformValue: (value: Value, header: number | string) => Value;
};

export type CsvStringifyConfig = {
  delimiter: string;
  newline: string;
  headers: string[];
};

/**
 * Parses csv strings conforming to rfc4180.
 * @param text
 * @param config
 * @returns
 */
export function parseCsv(text: string, config?: Partial<CsvParseConfig>) {
  const defaultConfig: CsvParseConfig = {
    delimiter: ",",
    escape: '"',
    skipLines: 0,
    headers: true,
    nullValue: "",
    transformHeaders: (headers) => headers.map((header) => header.trim()),
    transformRecord: (record) => record,
    transformValue: (value, header) => {
      const trimmedValue = String(value).trim();
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        trimmedValue === config?.nullValue
      )
        return null;
      else if (!isNaN(+value)) return Number(value);
      else return trimmedValue;
    },
  };

  let {
    delimiter,
    escape,
    skipLines,
    headers,
    transformHeaders,
    transformRecord,
    transformValue,
  } = {
    ...defaultConfig,
    ...config,
  };

  // todo: implement buffer as a pair of slice indices
  let buffer: string = "";
  let escaped: boolean = false;
  let fields: string[] = [];
  let objectRecords: Record[] = [];
  let valueRecords: Value[][] = [];
  let numLines: number = 0;

  const appendField = () => {
    fields.push(buffer);
    buffer = "";
  };

  const addFieldToRecord = (
    record: Record,
    header: string,
    index: number,
  ): Record => ({
    ...record,
    [header]: transformValue(fields[index], header),
  });

  const appendRecord = () => {
    // skip until we have passed the skipLines threshold
    if (numLines >= skipLines) {
      if (headers) {
        // skip the first line of input if headers are present in the input file (eg: headers: true)
        if (numLines === skipLines && !Array.isArray(headers)) {
          headers = transformHeaders(fields);
          fields = [];
          numLines++;
          return;
        }
        // add all fields to the record object
        const record: Record = (headers as string[]).reduce(
          addFieldToRecord,
          {},
        );
        objectRecords.push(transformRecord(record) as Record);
      } else {
        const record: Value[] = (fields as Value[]).map(transformValue);
        valueRecords.push(transformRecord(record) as Value[]);
      }
    }
    fields = [];
    numLines++;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // handle delimiters and newlines
    if (!escaped && (char === delimiter || char === "\n")) {
      // on delimiters/newlines, push buffer to fields
      appendField();

      // on newlines, push fields to record
      if (char === "\n") {
        appendRecord();
      }
    }

    // handle regular characters
    else if (char !== escape) {
      buffer += char;
    }

    // handle escape characters
    else if (char === escape) {
      // handle escaped double quotes
      if (escaped && text[i + 1] === escape) {
        i++;
        buffer += escape;
        continue;
      }

      // otherwise, toggle the "escaped" flag whenever we encounter quotes
      escaped = !escaped;
    }
  }

  if (buffer.length > 0) {
    appendField();
  }

  if (fields.length > 0) {
    appendRecord();
  }

  if (headers) {
    return {
      headers: headers as string[],
      data: objectRecords,
    };
  } else {
    return valueRecords;
  }
}

/**
 * Generates rfc4180-compliant csv files from arrays of arrays/objects
 * If an array of objects is provided, the config.headers property
 * allows the user to specify headers as an array of strings
 *
 * @param data
 * @param config
 * @returns
 */
export function stringifyCsv(
  data: Record[] | Value[][],
  config?: Partial<CsvStringifyConfig>,
) {
  const defaultConfig: Partial<CsvStringifyConfig> = {
    delimiter: ",",
    newline: "\r\n",
  };

  let { delimiter, newline, headers } = {
    ...defaultConfig,
    ...config,
  };

  const escape = (value: Value) =>
    typeof value !== "number"
      ? `"${String(value).replace(/"/g, '""')}"`
      : value;

  const rows: String[] = [];

  for (let row of data) {
    if (!Array.isArray(row)) {
      if (!headers) {
        headers = Object.keys(row);
      }
      if (rows.length === 0) {
        rows.push(headers.map(escape).join(delimiter));
      }
      row = headers.map((header) => (row as Record)[header]);
    }

    rows.push(row.map(escape).join(delimiter));
  }

  return rows.join(newline);
}
