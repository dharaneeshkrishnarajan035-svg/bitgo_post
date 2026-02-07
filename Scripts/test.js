const moment = require("moment-timezone");
const fieldMapping = [
  {
    sFField: "Name",
    sFFieldKey: "Name",
    sFFieldType: "Text",
    fDField: "Name",
    fDFieldKey: "name",
    fDFieldType: "Text",
    isDefaultField: true,
  },
  {
    sFField: "Email",
    sFFieldKey: "Email",
    sFFieldType: "Text",
    fDField: "Email",
    fDFieldKey: "email",
    fDFieldType: "Text",
    isDefaultField: true,
  },
  {
    sFField: "Phone",
    sFFieldKey: "Phone",
    sFFieldType: "Text",
    fDField: "Phone",
    fDFieldKey: "phone",
    fDFieldType: "Text",
    isDefaultField: true,
  },
  {
    sFField: "Mobile Phone",
    sFFieldKey: "MobilePhone",
    sFFieldType: "Text",
    fDField: "Mobile Phone",
    fDFieldKey: "mobile",
    fDFieldType: "Text",
    isDefaultField: true,
  },
  {
    sFField: "Time Zone",
    sFFieldKey: "TimeZoneSidKey",
    sFFieldType: "Dropdown",
    fDField: "Time Zone",
    fDFieldKey: "time_zone",
    fDFieldType: "Text",
    isDefaultField: true,
  },
  {
    sFField: "Title",
    sFFieldKey: "Title",
    sFFieldType: "Text",
    fDField: "Job Title",
    fDFieldKey: "job_title",
    fDFieldType: "Text",
    isDefaultField: true,
  },
  {
    sFField: "Website",
    sFFieldKey: "Website",
    sFFieldType: "Text",
    fDField: "Domain",
    fDFieldKey: "domains",
    fDFieldType: "Array of Text",
    isDefaultField: true,
  },
  {
    sFField: "Acquisition Date",
    sFFieldKey: "mkto71_Acquisition_Date__c",
    sFFieldType: "Datetime",
    fDField: "Acquisition Date",
    fDFieldKey: "acquisition_date",
    fDFieldType: "Date",
    isDefaultField: false,
  },
  {
    sFField: "Partner Welcome Email",
    sFFieldKey: "Partner_Welcome_Email__c",
    sFFieldType: "Dropdown",
    fDField: "Partner Welcome Email",
    fDFieldKey: "partner_welcome_email",
    fDFieldType: "Dropdown",
    isDefaultField: false,
  },
  {
    sFField: "Case Type",
    sFFieldKey: "Type",
    sFFieldType: "Dropdown",
    fDField: "Type",
    fDFieldKey: "type",
    fDFieldType: "Dropdown",
    isDefaultField: true,
  },
];

const dropdownMapping = {
  type: {
    Question: "Questdfdion",
    Problem: "Problem",
    "Feature Request": "Feature Request",
  },
};

const sourceType = "sFFieldType";
const destType = "fDFieldType";
const sourceKey = "sFFieldKey";
const destKey = "fDFieldKey";

const buildPayloadFromModule = (moduleRow, fieldMapping) => {
  const Payload = {};
  const customFields = {};
  const DEFAULT_TIMEZONE = "UTC";

  const transformValue = (value, sourceType, destType) => {
    if (value == null || value === "") return null;

    if (Array.isArray(value)) {
      if (destType === "Dropdown") return value[0];
      if (destType === "Text") return value.join(", ");
      if (destType === "Array of Text") return value.map(String);
    }

    const map = {
      "Text-Text": (v) => String(v),
      "Text-Array of Text": (v) => [String(v)],
      "Number-Text": (v) => String(v),
      "Number-Number": (v) => Number(v),
      "Boolean-Text": (v) => (v ? "true" : "false"),
      "Boolean-Boolean": (v) => Boolean(v),
      "Dropdown-Dropdown": (v) => v,
      "Dropdown-Text": (v) => String(v),
      "Date-Date": (v) => moment(v).format("YYYY-MM-DD"),
      "Datetime-Date": (v) =>
        moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DD"),
      "Datetime-Datetime": (v) =>
        moment.tz(v, DEFAULT_TIMEZONE).format("YYYY-MM-DDTHH:mm:ss[Z]"),
    };

    const key = `${sourceType}-${destType}`;
    return map[key] ? map[key](value) : value;
  };

  fieldMapping.forEach((map) => {
    const rawValue = moduleRow[map[sourceKey]];
    let transformed = transformValue(rawValue, map[sourceType], map[destType]);

    if (
      transformed == null ||
      transformed === "" ||
      (Array.isArray(transformed) && transformed.length === 0)
    )
      return;

    if (
      map.isDefaultField &&
      map[destType] === "Dropdown" &&
      dropdownMapping[map[destKey]]
    ) {
      // Map the raw or transformed value using the provided dropdownMapping
      transformed = dropdownMapping[map[destKey]][transformed] || transformed;
    }

    if (map.isDefaultField) Payload[map[destKey]] = transformed;
    else customFields[map[destKey]] = transformed;
  });

  Object.entries(customFields).forEach(([key, val]) => {
    Payload[`custom_fields[${key}]`] = val;
  });

  return Payload;
};

const moduleRow = {
  Name: "ACME Corp",
  Email: "test@acme.com",
  Phone: "1234567890",
  Website: "acme.com",
  MobilePhone: "9876543210",
  TimeZoneSidKey: "GMT",
  Title: "Manager",
  mkto71_Acquisition_Date__c: "2025-08-23T10:15:00Z",
  Partner_Welcome_Email__c: "WelcomeOption1",
  Type: "Question",
};

const payload = buildPayloadFromModule(moduleRow, fieldMapping);
console.log("sss",payload);
