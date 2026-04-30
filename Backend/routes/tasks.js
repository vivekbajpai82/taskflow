const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.members.some(m => m.user.toString() === userId.toString()) ||
         project.owner.toString() === userId.toString();
};

const isProjectAdmin = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  const member = project.members.find(m => m.user.toString() === userId.toString());
  return project.owner.toString() === userId.toString() ||
         (member && member.role === 'admin');
};

// GET /api/tasks - Get all tasks (dashboard)
router.get('/', protect, async (req, res) => {
  try {
    // Get all projects user is part of
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    });
    const projectIds = projects.map(p => p._id);

    const filter = { project: { $in: projectIds } };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.project) filter.project = req.query.project;

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    });
    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await isProjectMember(task.project._id, req.user._id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks - Create task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const isAdmin = await isProjectAdmin(projectId, req.user._id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only project admin can create tasks' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await isProjectMember(task.project, req.user._id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const { title, description, status, assignedTo, priority, dueDate } = req.body;

    // Members can only update status
    const isAdmin = await isProjectAdmin(task.project, req.user._id);
    if (!isAdmin) {
      if (status) task.status = status;
    } else {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = await isProjectAdmin(task.project, req.user._id);
    if (!isAdmin) return res.status(403).json({ message: 'Only admin can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;