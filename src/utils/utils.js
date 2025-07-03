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

async function processQuestionBankCSV(filePath, DataModel, mc, tc, sc) {
  const records = [];
  console.log("mc,tc,sc", mc, tc, sc)

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          module_code: mc,
          topic_code: tc,
          subtopic_code: sc,
          question_type: row.question_type,
          level: row.level,
          question: row.question,
          answer: row.answer,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
        };
        records.push(data);
        console.log(data)
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

async function processSkillAssessmentCSV(filePath, DataModel, mc, tc, sc) {
  const records = [];
  console.log("mc,tc,sc", mc, tc, sc)


  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          module_code: mc,
          topic_code: tc,
          subtopic_code: sc,
          question_type: row.question_type,
          level: row.level,
          question: row.question,
          answer: row.answer,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
        };
        records.push(data);
        console.log("data", data)
      })
      .on("end", () => {
        console.log("records", records)
        DataModel.insertMany(records)
          .then((result) => {
            console.log("CSV data inserted into MongoDB-SkillAssessment");

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

async function processTIYCSV(filePath, DataModel, mc, tc, sc) {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          module_code: mc,
          topic_code: tc,
          subtopic_code: sc,
          question_type: row.question_type,
          level: row.level,
          question: row.question,
          answer: row.answer,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
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
async function processMainQuestionBankCSV(filePath, DataModel,) {
  const records = [];
  console.log("filePath", filePath)
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          sno: row.sno,
          module_code: row.module_code,
          topic_code: row.topic_code,
          level: row.level,
          type: row.type,
          question_type: row.question_type,
          reference: row.reference,
          question: row.question,
          answer: row.answer,
          mcq_question: row.mcq_question,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
          time_duration: row.time_duration,
          isTIYQustion: row.isTIYQustion === 'TRUE' ? true : false,
          isQuestionBank: row.isQuestionBank === 'TRUE' ? true : false
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

async function processCompanyCSV(filePath, DataModel,) {
  const records = [];
  console.log("filePath", filePath)
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const data = {
          company_name: row.name,
          company_website: row.site_url,
          company_logo: row.logo_url,
          company_description: row.domain
         
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
  processMainQuestionBankCSV,
  processCompanyCSV
};
