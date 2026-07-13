const { Schema, model } = require('mongoose');

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    dateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'attended', 'no-show', 'cancelled'],
      default: 'scheduled',
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Used by cascade delete and analytics queries
appointmentSchema.index({ doctorId: 1, dateTime: 1, status: 1 });
appointmentSchema.index({ departmentId: 1, dateTime: 1 });
appointmentSchema.index({ patientId: 1, dateTime: 1 });

module.exports = model('Appointment', appointmentSchema);
