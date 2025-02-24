const Task = require('../models/Task');
const Project = require('../models/Project');

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignees, projectId } = req.body;

    // Validate required fields
    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and project ID are required' });
    }

    // Check if user has access to project
    const project = await Project.findOne({
      _id: projectId,
      members: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create task with validated data
    const task = new Task({
      title,
      description: description || '',
      dueDate: dueDate || null,
      assignees: Array.isArray(assignees) ? assignees : [],
      project: projectId,
      createdBy: req.user._id,
      status: 'todo'
    });

    await task.save();

    // Add task to project
    await Project.findByIdAndUpdate(projectId, {
      $push: { tasks: task._id }
    });

    // Populate assignees for response
    await task.populate('assignees', 'username email');
    await task.populate('createdBy', 'username email');
    
    // Emit socket event
    req.io.to(projectId).emit('task-created', task);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
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
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    console.log('Update task request:', {
      taskId: req.params.id,
      body: req.body,
      userId: req.user._id
    });

    // First check if the task exists
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Then check if user has access to the project
    const project = await Project.findOne({
      _id: task.project,
      members: req.user._id
    });

    if (!project) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'status', 'dueDate', 'assignees'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      console.log('Invalid updates:', updates);
      return res.status(400).json({ 
        error: 'Invalid updates',
        allowedUpdates,
        receivedUpdates: updates
      });
    }

    // Validate and format updates
    if (updates.includes('status')) {
      const validStatuses = ['todo', 'in-progress', 'done'];
      if (!validStatuses.includes(req.body.status)) {
        console.log('Invalid status:', req.body.status);
        return res.status(400).json({ 
          error: 'Invalid status value',
          validStatuses,
          receivedStatus: req.body.status
        });
      }
    }

    if (updates.includes('assignees')) {
      if (!Array.isArray(req.body.assignees)) {
        console.log('Invalid assignees:', req.body.assignees);
        return res.status(400).json({ 
          error: 'Assignees must be an array',
          receivedAssignees: req.body.assignees
        });
      }
      // Verify all assignees are project members
      const invalidAssignees = req.body.assignees.filter(
        assigneeId => !project.members.includes(assigneeId)
      );
      if (invalidAssignees.length > 0) {
        console.log('Invalid assignees:', invalidAssignees);
        return res.status(400).json({ 
          error: 'Some assignees are not project members',
          invalidAssignees
        });
      }
    }

    // Apply updates with proper formatting
    updates.forEach(update => {
      if (update === 'dueDate') {
        task[update] = req.body[update] || null;
      } else if (update === 'assignees') {
        task[update] = req.body[update] || [];
      } else {
        task[update] = req.body[update];
      }
    });

    await task.save();

    // Populate updated task
    await task.populate('assignees', 'username email');
    await task.populate('createdBy', 'username email');
    
    // Emit socket event
    req.io.to(task.project.toString()).emit('task-updated', task);

    console.log('Task updated successfully:', task);
    res.json(task);
  } catch (error) {
    console.error('Update task error:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params.id,
      body: req.body
    });
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

    // Emit socket event
    req.io.to(task.project.toString()).emit('task-deleted', task._id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
}; 