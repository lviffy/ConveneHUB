const { TenantModel } = require('../models/Tenant');

function buildTenantName(tenantId, explicitName) {
  if (explicitName && explicitName.trim()) {
    return explicitName.trim();
  }

  return tenantId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

async function syncTenantRecord(options) {
  const tenantId = options.tenantId?.trim();
  if (!tenantId) {
    return null;
  }

  const addToSet = {};
  if (options.adminId) addToSet.adminIds = options.adminId;
  if (options.organizerId) addToSet.organizerIds = options.organizerId;

  const set = {};
  if (options.campusId) set.campusId = options.campusId;
  if (options.name?.trim()) set.name = options.name.trim();

  const update = {
    $setOnInsert: {
      tenantId,
      ...(!options.name?.trim() ? { name: buildTenantName(tenantId, options.name) } : {}),
      ...(!options.campusId ? {} : {}),
    },
  };

  if (Object.keys(set).length > 0) {
    update.$set = set;
  }

  if (Object.keys(addToSet).length > 0) {
    update.$addToSet = addToSet;
  }

  return TenantModel.findOneAndUpdate({ tenantId }, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
}

module.exports = { syncTenantRecord };
