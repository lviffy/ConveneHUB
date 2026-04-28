const { Schema, model } = require('mongoose');

const tenantSchema = new Schema(
  {
    tenantId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    campusId: { type: String, trim: true },
    adminIds: { type: [String], default: [] },
    organizerIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

const TenantModel = model('Tenant', tenantSchema);

module.exports = { TenantModel };
