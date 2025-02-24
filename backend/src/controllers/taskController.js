const Task = require('../models/Task');
const Project = require('../models/Project');

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignees, projectId } = req.body;

    // Check if user has access to project
    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id
    });

    await task.save();

    // Add task to project
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: task._id }
    });

    // Populate assignees for response
    await task.populate('assignees', 'username email');
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get tasks for a project
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    // Check project access
    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Build query
    const query = { project: projectId };
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('assignees', 'username email')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      project: { $in: req.user.projects }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'status', 'dueDate', 'assignees'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();

    // Populate updated task
    await task.populate('assignees', 'username email');
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      project: { $in: req.user.projects }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove task from project
    await Project.findByIdAndUpdate(task.project, {
      $pull: { tasks: task._id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 