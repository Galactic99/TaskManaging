const Project = require('../models/Project');
const User = require('../models/User');

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      owner: req.user._id
    });

    await project.save();
    
    // Add project to user's projects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: project._id }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all projects for current user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id
    }).populate('owner', 'username email');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      members: req.user._id
    })
    .populate('owner', 'username email')
    .populate('members', 'username email')
    .populate({
      path: 'tasks',
      populate: {
        path: 'assignees',
        select: 'username email'
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => project[update] = req.body[update]);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Remove project from all users' projects array
    await User.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add member to project
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ error: 'User already a member' });
    }

    project.members.push(user._id);
    await project.save();

    // Add project to user's projects
    await User.findByIdAndUpdate(user._id, {
      $push: { projects: project._id }
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 