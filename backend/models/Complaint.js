const mongoose = require('mongoose');

const CATEGORIES = [
  'Electricity',
  'Water',
  'Wi-Fi',
  'Hostel',
  'Cleanliness',
  'Infrastructure',
  'Other',
];

const STATUSES = ['Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'];

const remarkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    status: { type: String, enum: STATUSES },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: null },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    suggestedCategory: { type: String }, // what the AI matcher suggested
    remarks: [remarkSchema],
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
