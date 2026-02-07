const formatGroupPayload = (sourceData) => {
  return {
    name: sourceData.Name,
    description: sourceData.Description
  };
};



module.exports = { formatGroupPayload }
