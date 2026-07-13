const { Schema, model } = require('mongoose');

/**
 * A window of time a doctor has marked themselves unavailable for booking.
 * Not in the original plan.md schema — added to support the Doctor
 * Dashboard's Block Time feature. Follows the same soft-delete convention
 * as User/Department/Appointment (isActive + deletedAt) so it's consistent
 * with the rest of the schema and safe to query alongside them.
 */
const blockTimeSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // "HH:mm", 24h
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    reason: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Doctor's own blocks for a given day — same access pattern as
// Appointment's { doctorId, dateTime, status } index.
blockTimeSchema.index({ doctorId: 1, date: 1, isActive: 1 });

module.exports = model('BlockTime', blockTimeSchema);
