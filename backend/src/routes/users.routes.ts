import express, { Request, Response, NextFunction } from 'express';
import Users from '../models/users.model.js';
import authenticateJWT from '../middlewares/authjwt.middleware.js';
import isadmin from '../middlewares/isadmin.middlewares.js';
import Projects from '../models/projects.model.js';
import { Tasks } from '../models/index.js';

const router = express.Router();


// Post a user
router.post('/user', authenticateJWT, isadmin, async (req: Request, res: Response) => {
    try {
        const user = await Users.create(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user', details: err });
    }
});

// Get all users
router.get('/user', authenticateJWT, isadmin, async (req: Request, res: Response) => {
    try {
        const users = await Users.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


// Update user
router.put('/user/:id', authenticateJWT, isadmin, async (req: Request, res: Response) => {
    try {
        const user = await Users.findByPk(req.params.id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        user.set(req.body);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Delete user
router.delete('/user/:id', authenticateJWT, isadmin, async (req: Request, res: Response) => {
  try {
    const user = await Users.findByPk(Number(req.params.id));
    if (!user) {
       res.status(404).json({ error: 'User not found' });
       return;
    }

    await user.destroy(); // ✅ this will trigger beforeDestroy
    res.json({ message: 'Project and associated tasks deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Get project Members
router.get('/project/userpage/user', authenticateJWT, isadmin, async (_req: Request, res: Response) => {
  const rawProjectId = _req.query.projectId;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  if (!projectId || isNaN(Number(projectId))) {
    res.status(400).json({ message: 'Invalid projectId' });
    return;
  }

  try {
    const project = await Projects.findByPk(Number(projectId), {
      include: [{
        model: Users,
        as: 'members',
        through: { attributes: [] } // don't include join table data
      }]
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project.members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching project members' });
  }
});

// Update task status
router.put('/tasks/user/:id',authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { task_id } = req.query;
  const { status } = req.body;

  const requesterId = req.user?.id;

  if (!task_id || !status) {
     res.status(400).json({ message: 'task_id and status are required.' });
     return;
  }
  if (!requesterId) {
     res.status(401).json({ message: 'Unauthorized' });
     return;
  }

  try {
    // Find task by user_id and project_id
    const task = await Tasks.findByPk(Number(task_id));

    if (!task) {
       res.status(404).json({ message: 'Task not found.' });
       return;
    }
    const user = await Users.findByPk(requesterId);
    if (!user) {
       res.status(404).json({ message: 'User not found.' });
       return;
    }

    if (!user.isAdmin && !(task.user_id === Number(id) && requesterId === Number(id))) {
       res.status(403).json({ message: 'You are not authorized to update this task.' });
       return;
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
