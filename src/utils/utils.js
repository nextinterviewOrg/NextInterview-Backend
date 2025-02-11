const fs = require("fs");
const csvParser = require("csv-parser");

async function processChallengesCSV(filePath, DataModel) {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          sno: row.sno,
          topic_name: row.topic_name,
          level: row.level,
          type: row.type,
          reference: row.reference,
          question: row.question,
          answer: row.answer,
          mcq_question: row.mcq_question,
          option_1: row.option_1,
          option_2: row.option_2,
          option_3: row.option_3,
          option_4: row.option_4,
          time_duration: row.time_duration,
        };
        records.push(data);
      })
      .on("end", () => {
        DataModel.insertMany(records)
          .then(() => {
            console.log("CSV data inserted into MongoDB");
            resolve();
          })
          .catch((err) => {
            console.error("Error inserting data into MongoDB:", err);
            reject(err);
          });
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
}

async function processQuestionBankCSV(filePath, DataModel) {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          sno: row.sno,
          topic_name: row.topic_name,
          level: row.level,
          type: row.type,
          reference: row.reference,
          question: row.question,
          answer: row.answer,
          mcq_question: row.mcq_question,
          option_1: row.option_1,
          option_2: row.option_2,
          option_3: row.option_3,
          option_4: row.option_4,
          time_duration: row.time_duration,
        };
        records.push(data);
      })
      .on("end", () => {
        DataModel.insertMany(records)
          .then(() => {
            console.log("CSV data inserted into MongoDB");
            resolve();
          })
          .catch((err) => {
            console.error("Error inserting data into MongoDB:", err);
            reject(err);
          });
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
}

async function processSkillAssessmentCSV(filePath, DataModel) {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          sno: row.sno,
          topic_name: row.topic_name,
          level: row.level,
          type: row.type,
          reference: row.reference,
          question: row.question,
          answer: row.answer,
          mcq_question: row.mcq_question,
          option_1: row.option_1,
          option_2: row.option_2,
          option_3: row.option_3,
          option_4: row.option_4,
          time_duration: row.time_duration,
        };
        records.push(data);
      })
      .on("end", () => {
        DataModel.insertMany(records)
          .then(() => {
            console.log("CSV data inserted into MongoDB");
            resolve();
          })
          .catch((err) => {
            console.error("Error inserting data into MongoDB:", err);
            reject(err);
          });
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
}

async function processTIYCSV(filePath, DataModel) {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          sno: row.sno,
          topic_name: row.topic_name,
          level: row.level,
          type: row.type,
          reference: row.reference,
          question: row.question,
          answer: row.answer,
          mcq_question: row.mcq_question,
          option_1: row.option_1,
          option_2: row.option_2,
          option_3: row.option_3,
          option_4: row.option_4,
          time_duration: row.time_duration,
        };
        records.push(data);
      })
      .on("end", () => {
        DataModel.insertMany(records)
          .then(() => {
            console.log("CSV data inserted into MongoDB");
            resolve();
          })
          .catch((err) => {
            console.error("Error inserting data into MongoDB:", err);
            reject(err);
          });
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
}
module.exports = {
  processChallengesCSV,
  processQuestionBankCSV,
  processSkillAssessmentCSV,
  processTIYCSV,
};
