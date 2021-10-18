import { format as formatDate, isBefore, subDays } from "date-fns";
import { records } from './refactorData'

interface DbRecord {
  [key: string]: string | number
}

interface UsageHistory {
  date: string;
  usage: number;
}

interface Datum {
  technology: string;
  amountUsed?: number;
  usageHistory?: UsageHistory[];
}

/* 
These functions take a list of database records and a date as input. They returns an array of objects, where the 
latter are described by the Datum interface.

The returned array is used as the input for a chart located elsewhere in the project. 
*/

console.log(
  sortDatum(
    combineRecords(
      filterRecords({
        recordList: records, 
        selectedDate: "2021-08-15"
      })
    )
  )
)

function filterRecords ({selectedDate, recordList}: {
  selectedDate: string,
  recordList: DbRecord[]
}):  DbRecord[] {
  const beginningDate = formatDate(
    subDays(new Date(selectedDate), 7),
    "yyyy-MM-dd"
  );
  return recordList.filter(record => {
    return !isBefore(new Date(record['date']), new Date(beginningDate))
      && isBefore(new Date(record['date']), new Date(selectedDate))
  })
}

function combineRecords(recordList: DbRecord[]): Record<string, Datum> {
  const irrelevantKeys = ['PK', 'SK', 'updatedAt', 'entity', 'key', 'date', 'name']
  return recordList.reduce((combinedRecords, record) => {
    Object.keys(record)
      .filter(key => irrelevantKeys.every(irrelevantKey => irrelevantKey !== key))
      .forEach(key => {
        combinedRecords = {
          ...combinedRecords,
          [key]: {
            technology: key,
            amountUsed: Number(combinedRecords?.[key]?.['amountUsed'] || 0) + Number(record[key]),
            usageHistory: combinedRecords[key] ? [
              ...combinedRecords?.[key]['usageHistory'],
              {
                date: record['date'],
                usage: record[key],
              }
            ].sort((historyOne, histroyTwo ) => Number(histroyTwo.usage) - Number(historyOne.usage))
              : 
            [{
              date: record['date'],
              usage: record[key],
            }]
          } as Datum
        }
      })
    return combinedRecords
  }, {} as Record<string, Datum>)
}

function sortDatum(datum: Record<string, Datum>): Datum[] {
  return Object.values(datum)
    .sort((datumOne, datumTwo) => datumTwo.amountUsed - datumOne.amountUsed)
    .slice(0, 10)
}