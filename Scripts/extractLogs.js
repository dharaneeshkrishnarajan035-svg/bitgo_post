const fs = require("fs");
const path = require("path");

// Path to your log file
// const logFile = "D:\\Migration\\Proxim\\PROXIM_POST\\PROXIM_MIGRATION\\Logs1\\Company\\Error.log";
const logFile = "D:\\Migration\\Proxim\\PROXIM_POST\\PROXIM_MIGRATION\\Logs1\\Requester\\Error.log";

function extractErrorsFromLog(filePath) {
  const logContent = fs.readFileSync(filePath, "utf-8");
  const lines = logContent.split("\n");

  // const errorLines = lines.filter(line => line.includes("❌ ERROR")); //Company
  const errorLines = lines.filter(line => line.includes("❌ERROR")); //Requester
  const results = [];

  for (const line of errorLines) {
    try {
      // const match = line.match(/❌ ERROR Occured at Company creation else : (.*?) :({.*}) : ({.*})/);
      const match = line.match(
        /❌\s*ERROR Occured at Requester Creation\s*:\s*(.*?)\s*:\s*({.*})\s*:\s*({.*})/
      );
      

      if (!match) continue;

      const meta = match[1].trim();
      const sourcePayload = JSON.parse(match[2]);
      const errorData = JSON.parse(match[3]);

      const sourceId = meta.split(" ")[0];

      //Company
      // for (const err of errorData.errors) {
      //   let field = err.field;
      //   let invalidValue;

      //   // Handle nested field paths like custom_fields.partner_level
      //   const keys = field.split(".");
      //   let temp = sourcePayload;
      //   for (const k of keys) {
      //     if (temp && k in temp) {
      //       temp = temp[k];
      //     }
      //   }
      //   invalidValue = temp;

      //   results.push({
      //     sourceId,
      //     errorField: field,
      //     invalidValue,
      //     errorMessage: err.message
      //   });
      // }

      const err=errorData
      let field = err.field;
      let invalidValue;

      // Handle nested field paths like custom_fields.partner_level
      const keys = field.split(".");
      let temp = sourcePayload;
      for (const k of keys) {
        if (temp && k in temp) {
          temp = temp[k];
        }
      }
      invalidValue = temp;

      results.push({
        sourceId,
        errorField: field,
        invalidValue,
        errorMessage: err.message
      });
      
    } catch (e) {
      console.error("Failed to parse error line:", e.message, "\nLine:", line);
    }
  }

  return results;
}
const errorsReport = extractErrorsFromLog(logFile);
console.log("Writing Log");
// fs.writeFileSync("D:\\Migration\\Proxim\\PROXIM_POST\\PROXIM_MIGRATION\\Logs1\\Company\\ErrorReport.json",JSON.stringify(errorsReport, null, 2))
fs.writeFileSync("D:\\Migration\\Proxim\\PROXIM_POST\\PROXIM_MIGRATION\\Logs1\\Requester\\ErrorReport.json",JSON.stringify(errorsReport, null, 2))
console.log("Written Log");

const groupedOptions = {};
for (const err of errorsReport) {
  if (!groupedOptions[err.errorField]) groupedOptions[err.errorField] = new Set();
  if (Array.isArray(err.invalidValue)) {
    err.invalidValue.forEach(v => groupedOptions[err.errorField].add(v));
  } else {
    groupedOptions[err.errorField].add(err.invalidValue);
  }
}

console.log("\n⚠️ New Options Found:");
for (const [field, values] of Object.entries(groupedOptions)) {
  console.log(`\n${field}:`);
  Array.from(values).forEach(v => {
    console.log(`  ${v}`);
  });
}
