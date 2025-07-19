import express, { Request, Response } from 'express';
import authenticateJWT from '../middlewares/authjwt.middleware.js';
import isadmin from '../middlewares/isadmin.middlewares.js';
import Tasks from '../models/tasks.model.js';
import Users from '../models/users.model.js';
import Projects from '../models/projects.model.js';

const router = express.Router();

// Get tasks by projectId
router.get('/projects/tasks',authenticateJWT, async (req: Request, res: Response) => {
  try {
    const rawProjectId = req.query.id;
    const userId = req.user?.id;

    const projectId = Array.isArray(rawProjectId) ? Number(rawProjectId[0]) : Number(rawProjectId);

    if (!projectId || isNaN(projectId)) {
       res.status(400).json({ message: 'Invalid projectId' });
       return;
    }

    if (!userId || isNaN(userId)) {
       res.status(400).json({ message: 'Invalid userId' });
       return;
    }

    const user = await Users.findByPk(userId);

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    // Admins can access all tasks
    if (user.isAdmin) {
      const tasks = await Tasks.findAll({
        where: { projects_id: projectId },
        include: [
          {
            model: Users,
            attributes: ['id', 'name'],
          },
        ],
      });
      res.json(tasks);
      return;
    }

// If not admin, check if user is a member of the project
    const project = await Projects.findByPk(projectId);

    if (!project) {
       res.status(404).json({ message: 'Project not found' });
       return;
    }

    const isMember = await project.hasMember(user);

    if (!isMember) {
       res.status(403).json({ message: 'You are not authorized to access tasks for this project.' });
       return;
    }

    // If member, allow
    const tasks = await Tasks.findAll({
      where: { projects_id: projectId },
      include: [
        {
          model: Users,
          attributes: ['id', 'name'],
        },
      ],
    });

     res.json(tasks);

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks for project' });
  }
});

//Create post
router.post('/project/tasks', authenticateJWT, isadmin, async (req: Request, res: Response) => {
  try {
    if (new Date(req.body.finish_date) < new Date(req.body.start_date)) {
      res.status(400).json({ error: 'Finish date cannot be earlier than start date' });
      return;
    }
    const task = await Tasks.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});
// Update task
router.put('/tasks/:id',authenticateJWT, isadmin, async (req: Request, res: Response) => {
  try {
    if (new Date(req.body.finish_date) < new Date(req.body.start_date)) {
      res.status(400).json({ error: 'Finish date cannot be earlier than start date' });
      return;
    }
    const [updated] = await Tasks.update(req.body, {
      where: { id: Number(req.params.id) },
    });
    res.json({ updated });
  } catch (err) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Delete task
router.delete('/project/tasks/:id', authenticateJWT, isadmin, async (req: Request, res: Response) => {
  try {
    const deleted = await Tasks.destroy({
      where: { id: Number(req.params.id) },
    });
    res.json({ deleted });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

export default router;
