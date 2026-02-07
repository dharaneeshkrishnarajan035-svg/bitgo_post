const zendeskData = [
  'Escalated::Dev Review',
  'Escalated::JIRA',
  'Leadership Review',
  'Support QA Review::Non Urgent',
  'Support QA Review::Normal',
  'Support QA Review::Urgent',
  'System-Wide Issue/Outage'
];

// function buildFreshdeskNestedChoices(zendeskData) {
//   const rootChoices = [];

//   function insertPath(root, path, level = 1) {
//     if (path.length === 0) return;

//     const value = path[0];
//     let existing = root.find(c => c.value === value);

//     if (!existing) {
//       existing = {
//         label: value,
//         value,
//         position: root.length + 1,
//       };
//       if (path.length > 1) existing.choices = [];
//       root.push(existing);
//     }

//     if (path.length > 1) {
//       if (!existing.choices) existing.choices = [];
//       insertPath(existing.choices, path.slice(1), level + 1);
//     }
//   }

//   for (const item of zendeskData) {
//     const path = item.split('::').map(str => str.trim());
//     insertPath(rootChoices, path);
//   }

//   return {
//     customers_can_edit: false,
//     label_for_customers: "Issue",
//     displayed_to_customers: false,
//     label: "Issue",
//     position: 1,
//     type: "nested_field",
//     choices: rootChoices,
//     dependent_fields: [
//       { label: "Issue", label_for_customers: "Issue", level: 2 },
//       { label: "Root Issue", label_for_customers: "Root Issue", level: 3 },
//       { label: "Sub Issue", label_for_customers: "Sub Issue", level: 4 }
//     ]
//   };
// }

function buildFreshdeskNestedChoices(zendeskData) {
  const rootChoices = [];

  function insertPath(root, pathParts) {
    const [first, second, ...rest] = pathParts;

    // Find or create the first level
    let firstNode = root.find(c => c.value === first);
    if (!firstNode) {
      firstNode = {
        label: first,
        value: first,
        position: root.length + 1,
        choices: [],
      };
      root.push(firstNode);
    }

    // Find or create the second level
    if (!second) return; // skip if no second level
    let secondNode = firstNode.choices.find(c => c.value === second);
    if (!secondNode) {
      secondNode = {
        label: second,
        value: second,
        position: firstNode.choices.length + 1,
        choices: [],
      };
      firstNode.choices.push(secondNode);
    }

    // Collapse the rest into the third level
    if (rest.length) {
      const collapsed = rest.join('::');
      if (!secondNode.choices.find(c => c.value === collapsed)) {
        secondNode.choices.push({
          label: collapsed,
          value: collapsed,
          position: secondNode.choices.length + 1,
        });
      }
    }
  }

  for (const item of zendeskData) {
    const pathParts = item.split('::').map(p => p.trim());
    insertPath(rootChoices, pathParts);
  }

  return {
    customers_can_edit: false,
    label_for_customers: "Categorize Open Ticket As",
    displayed_to_customers: false,
    label: "Categorize Open Ticket As",
    position: 4,
    type: "nested_field",
    choices: rootChoices,
    dependent_fields: [
      { label: "Root Category", label_for_customers: "Root Category", level: 2 },
      { label: "Sub Category", label_for_customers: "Sub Category", level: 3 }
    ]
  };
}


const nestedFieldPayload = buildFreshdeskNestedChoices(zendeskData);
console.log(JSON.stringify(nestedFieldPayload, null, 2));
