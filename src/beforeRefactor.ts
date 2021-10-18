import { format as formatDate, compareDesc, subDays } from "date-fns";
import { records } from './refactorData'

interface DbRecord {
  [key: string]: string | number
}

interface Datum {
  technology: string;
  amountUsed?: number;
  usageHistory: Record<"date" | "usage", string | number>[];
}

console.log(
  transform({
    recordList: records, 
    selectedDate: "2021-08-15"
  })
)

/* 
This function takes a list of database records and a date as input. It returns a list of maps. 
The shape of the maps are described by the Datum interface. 

The returned array is used as the input for a chart located elsewhere in the project. 
*/

function transform({selectedDate, recordList}: {
  selectedDate: string,
  recordList: DbRecord[]
}): Datum[] {
  // Gets beginning of the week prior to the selected end date
  const historicalDate = formatDate(
    subDays(new Date(selectedDate), 7),
    "yyyy-MM-dd"
  );
  // Constructs a map that contains a key for each of the technologies that has reported within the selected date range
  const gatheredData = recordList.reduce(
    (map, record) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { PK, SK, updatedAt, entity, key, date, ...rest } = record;
      return {
        ...map,
        ...rest,
      };
    },
    {}
  );
  /*
    For each technology where usage was reported from the week prior to the selected end date:
      1. Sums the gb used per day
      2. Constructs a list of maps where x is the reporting date & y is the gb used
      3. Sorts that list from earliest to latest date
      3. Returns a map containing the properties expected by the chart
    */
  const dataWithSums = Object.keys(gatheredData).reduce(
    (map, name) => {
      let sum = 0;
      let usageHistory = [];
      recordList.forEach((record) => {
        if (
          compareDesc(
            new Date(record["date"]),
            new Date(historicalDate)
          ) === -1 &&
          compareDesc(new Date(record["date"]), new Date(selectedDate)) >
            -1
        ) {
          sum = sum + Number(record[`${name}`]);
          usageHistory = [
            ...usageHistory,
            {
              date: formatDate(new Date(record["date"]), "M/dd"),
              usage: Number(record[`${name}`]) || 0,
            },
          ].sort((a, b) => compareDesc(new Date(b["date"]), new Date(a["date"])));
        }
      });
      return {
        ...map,
        [`${name}`]: {
          technology: name,
          amountUsed: sum,
          usageHistory,
        },
      } as Datum;
    },
    {}
  );

  if (!dataWithSums) {
    throw new Error(
      "There was a problem processing the data."
    );
  }
    /*
      1. Sorts the technology by gb used
      2. Slices the list to the top ten
      4. Removes the "amountUsed" property as it was only needed to sort the list
    */
    return (
      Object.values(dataWithSums)
        .sort((a, b) => {
          return b["amountUsed"] - a["amountUsed"];
        })
        .slice(0, 10)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ amountUsed, ...rest }) => {
          return {
            ...(rest as Datum)
          };
        }) as Datum[]
    );
}

/* 
Transform exists as a private method on this abstract class

class Page<Data> {
  // Returns a reference to itself so as to be chainable
  async fetchData(): Promise<Page<Data>> {
    throw new Error("Method not implemented.");
  }

  hydratePage(): ReactElement {
    throw new Error("Method not implemented.");
  }

  // Returns a reference to itself so as to be chainable
  shapeData?(): Page<Data> {
    throw new Error("Method not implemented.");
  }
}
*/

/*
function combineRecords(recordList: DbRecord[]): Record<string, Datum> {
  const irrelevantKeys = ['PK', 'SK', 'updatedAt', 'entity', 'key']
  return recordList.reduce((combinedRecords, record) => {
    Object.keys(record)
      .filter(key => irrelevantKeys.every(irrelevantKey => irrelevantKey !== key))
      .forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(combinedRecords, key)) {
          combinedRecords = {
            ...combinedRecords,
            [key]: {
              technology: key,
              amountUsed: Number(record[key]),
              usageHistory: [{
                usage: record[key],
                date: record['date']
              }]
            } as Datum
          }
        }
        combinedRecords = {
          ...combinedRecords,
          [key]: {
            amountUsed: Number(combinedRecords[key]?.amountUsed) + Number(record[key]),
            usageHistory: [
              ...combinedRecords[key]['usageHistory'],
              {
                usage: Number(record[key]),
                date: record.date
              }
            ]
          }
        }
      })
    return combinedRecords
  }, {} as Record<string, Datum>)
}
*/