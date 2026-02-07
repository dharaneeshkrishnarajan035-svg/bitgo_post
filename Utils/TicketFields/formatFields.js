const formatField = async (srcData, module, options = null) => {
  const fieldType = {
    contact: {
      string: "custom_text",
      double: "custom_text",
      currency: "custom_text",
      email: "custom_text",
      reference: "custom_text",
      textarea: "custom_paragraph",
      address: "custom_paragraph",
      phone: "custom_phone_number",
      int: "custom_number",
      picklist: "custom_dropdown",
      multipicklist: "custom_dropdown",
      boolean: "custom_checkbox",
      date: "custom_date",
      datetime: "custom_date",
      url: "custom_url",
    },
    agent: {
      string: "custom_text",
      double: "custom_text",
      currency: "custom_text",
      email: "custom_text",
      reference: "custom_text",
      textarea: "custom_paragraph",
      address: "custom_paragraph",
      phone: "custom_phone_number",
      int: "custom_number",
      picklist: "custom_dropdown",
      multipicklist: "custom_dropdown",
      boolean: "custom_checkbox",
      date: "custom_date",
      datetime: "custom_date",
      url: "custom_url",
    },
    company: {
      string: "custom_text",
      double: "custom_text",
      currency: "custom_text",
      email: "custom_text",
      reference: "custom_text",
      textarea: "custom_paragraph",
      address: "custom_paragraph",
      phone: "custom_phone_number",
      int: "custom_number",
      picklist: "custom_dropdown",
      multipicklist: "custom_dropdown",
      boolean: "custom_checkbox",
      date: "custom_date",
      datetime: "custom_date",
    },
    ticket: {
      string: "custom_text",
      double: "custom_decimal",
      currency: "custom_text",
      email: "custom_text",
      reference: "custom_text",
      textarea: "custom_paragraph",
      address: "custom_paragraph",
      phone: "custom_text",
      int: "custom_number",
      picklist: "custom_dropdown",
      multipicklist: "custom_dropdown",
      boolean: "custom_checkbox",
      date: "custom_date",
      datetime: "custom_date",
    },
  };

  const payload = {
    label: srcData["fDField"],
    type: fieldType[module][srcData["sFFieldType"]],
    position: 14 // Change this according to the field count exists in FDK
  };

  if (module === "contact" || module === "agent" || module === "ticket") {
    payload["label_for_customers"] = srcData["fDField"];
  }

  // if (module === "agent") {

  // }

  if (srcData["fDFieldType"] === "dropdown" && options)
    payload["choices"] = Object.values(options).map((item, i) => ({ value: item, position: i + 1 }));

  return payload;
};

module.exports = { formatField };
