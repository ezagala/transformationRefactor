import { compareDesc, isAfter, isBefore, subDays } from "date-fns";
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
These functions take an array of database records and a date as input. They return an array of objects, where the 
latter are described by the Datum interface.

The returned array is made up of data to be used as the input for a chart located elsewhere in the project. 
*/

console.log(
  listAndSortData(
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
  const beginningDate = subDays(new Date(selectedDate), 7)
  return recordList.filter(record => {
    return isAfter(new Date(record['date']), new Date(beginningDate))
      && isBefore(new Date(record['date']), new Date(selectedDate))
  })
}

/* 
A better implementation of combineRecords might express the usage history logic more concisely. 
Managing it within the scope of this function's reduce method prevents having to make another pass through 
the records list. However, the benefits of object access that that reduce provides are tempered by the need for the 
conditions on lines 65 & 66. 
*/
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
              ...combinedRecords[key]['usageHistory'],
              {
                date: record['date'],
                usage: record[key],
              }
            ].sort((historyA, historyB ) => compareDesc(new Date(historyB.date), new Date(historyA.date)))
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

function listAndSortData(datum: Record<string, Datum>): Datum[] {
  return Object.values(datum)
    .sort((datumOne, datumTwo) => datumTwo.amountUsed - datumOne.amountUsed)
    .slice(0, 10)
}

/*
An implementation of combineRecords where the conditions called out above get
a different treatment. I'm not convinced the verbosity results in better readability.

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