const express = require('express');
const Complaint = require('../models/Complaint');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { suggestCategory, suggestPriority } = require('../utils/categorySuggester');

const router = express.Router();

// POST /api/complaints/suggest-category  { description }
// Live "AI-assisted" suggestion the frontend can call as the student types.
router.post('/suggest-category', requireAuth, (req, res) => {
  const { description = '' } = req.body;
  const result = suggestCategory(description);
  const priority = suggestPriority(description);
  res.json({ ...result, suggestedPriority: priority });
});

// POST /api/complaints  (student creates a complaint, optional image)
router.post(
  '/',
  requireAuth,
  requireRole('student'),
  upload.single('image'),
  async (req, res) => {
    try {
      const { category, description, location } = req.body;
      if (!category || !description || !location) {
        return res.status(400).json({ message: 'Category, description and location are required' });
      }

      const { category: suggested } = suggestCategory(description);
      const priority = suggestPriority(description);

      const complaint = await Complaint.create({
        student: req.user.id,
        category,
        description,
        location,
        priority,
        suggestedCategory: suggested,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        remarks: [
          {
            text: 'Complaint submitted by student.',
            status: 'Pending',
            addedBy: req.user.id,
          },
        ],
      });

      res.status(201).json({ complaint });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create complaint', error: err.message });
    }
  }
);

// GET /api/complaints/mine  (student's own complaints)
router.get('/mine', requireAuth, requireRole('student'), async (req, res) => {
  const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
  res.json({ complaints });
});

// GET /api/complaints  (admin: all complaints, with filters)
// query params: status, category, priority, q (search in description/location)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { status, category, priority, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (q) {
    filter.$or = [
      { description: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
    ];
  }

  const complaints = await Complaint.find(filter)
    .populate('student', 'name email rollNumber hostel')
    .sort({ createdAt: -1 });

  res.json({ complaints });
});

// GET /api/complaints/stats  (admin dashboard analytics)
router.get('/stats', requireAuth, requireRole('admin'), async (req, res) => {
  const [byStatus, byCategory, total] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.countDocuments(),
  ]);

  res.json({
    total,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    byCategory: Object.fromEntries(byCategory.map((c) => [c._id, c.count])),
  });
});

// GET /api/complaints/:id
router.get('/:id', requireAuth, async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(
    'student',
    'name email rollNumber hostel'
  );
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  // students may only view their own complaint
  if (req.user.role === 'student' && String(complaint.student._id) !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view this complaint' });
  }

  res.json({ complaint });
});

// PATCH /api/complaints/:id/status  (admin updates status + optional remark/priority)
router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status, remark, priority } = req.body;
  const validStatuses = ['Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  if (remark) {
    complaint.remarks.push({
      text: remark,
      status: status || complaint.status,
      addedBy: req.user.id,
    });
  }

  await complaint.save();
  res.json({ complaint });
});

// DELETE /api/complaints/:id  (admin only, optional feature)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ message: 'Complaint deleted' });
});

module.exports = router;
