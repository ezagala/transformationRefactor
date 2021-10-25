# Refactoring a transformation

This repository contains an exercise where I refactor one function into several more specialized functions. My aim was to make the logic they encapsulate more digestible. You'll find three files in `./src`: `beforeRefactor.ts`, `afterRefactor.ts` and `refactorData.ts`. The first is the initial state of the logic, the second contains my efforts to refactor that logic and the third is a sample of data the functions can act upon. 

`npm run .` will print the output of the functions in `afterRefactor.ts` to the console. The repo's boilerplate was taken from [node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate). The authors recommend using it with the latest active LTS release of Node.

## Contextualizing the transformation

The functions solve a problem that arose in another project. Their purpose is to take as input records from a NoSQL database and return a list of datum, which is in turn used as input for a chart located elsewhere. The chart* shows the quantity (say, in GB) of a collection of technologies used over time. 


There a few things to note about the functions' input and output. The records from the database (i.e. the input) contain some keys that are irrelevant to the information we're ultimately concerned with. We know these keys prior to runtime. As such, it's trivial to filter them from our return value. The database records also contain keys which represent the names of the technologies used. Their corresponding values reflect as an integer the quantity that that technology was used (again, say, in GB). We do not know the individual technology names prior to runtime. 

Each index in our list of returned datum (i.e. the output) represents one technology, the total usage of the technology, in addition to how much that technology was used at certain points over the course of a given time period. The chart that renders the data is part of a report that describes an organization's operational health.  

___
*Imagine a chart similar to [this one](https://nivo.rocks/storybook/?path=/story/line--time-scale), where each technology is distributed along the y-axis.