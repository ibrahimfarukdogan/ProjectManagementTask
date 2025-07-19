import express, { Request, Response } from 'express';
import Projects from '../models/projects.model.js';
import authenticateJWT from '../middlewares/authjwt.middleware.js';
import isadmin from '../middlewares/isadmin.middlewares.js';
import Users from '../models/users.model.js';
import Tasks from '../models/tasks.model.js';

const router = express.Router();

// Create a new project
router.post('/projects/', authenticateJWT, isadmin, async (req: Request, res: Response) => {
  try {
    if (new Date(req.body.finish_date) < new Date(req.body.start_date)) {
      res.status(400).json({ error: 'Finish date cannot be earlier than start date' });
      return;
    }
    const project = await Projects.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get all projects
router.get('/projects/', authenticateJWT, isadmin, async (_req: Request, res: Response) => {
  try {
    const projects = await Projects.findAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Delete member from a project
router.delete('/projects/user/:id', authenticateJWT, isadmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const rawProjectId = req.query.projectId;
  const projectId = Array.isArray(rawProjectId)
    ? rawProjectId[0]
    : rawProjectId;

  if (!projectId || isNaN(Number(projectId))) {
    res.status(400).json({ message: 'Invalid projectId' });
    return;
  }

  try {
    const project = await Projects.findByPk(Number(projectId));

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const user = await Users.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMember = await project.hasMember(user);

    if (!isMember) {
      res.status(404).json({ message: 'User is not a member of this project' });
      return;
    }

    await project.removeMember(user);

    // Delete user’s tasks from this project
    await Tasks.destroy({
      where: {
        user_id: user.id,
        projects_id: Number(projectId),
      },
    });

    res.status(200).json({ message: 'User successfully removed from the project' });
  } catch (error: any) {
    console.error('Error removing project member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add member to a project
router.post('/projects/:id', authenticateJWT, isadmin, async (_req: Request, res: Response) => {
  const { id } = _req.params;
  const { userId } = _req.body;

  if (!userId) {
    res.status(400).json({ message: 'userId is required in the body' });
    return;
  }

  try {
    const project = await Projects.findByPk(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const user = await Users.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if already a member
    const alreadyMember = await project.hasMember(user);
    if (alreadyMember) {
      res.status(409).json({ message: 'User is already a member of this project' });
      return;
    }

    // Add the user to the project's members
    await project.addMember(user);

    res.status(200).json({ message: 'User successfully added to the project' });
  } catch (error: any) {
    console.error('Error adding project member:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Update project
router.put('/projects/:id', authenticateJWT, isadmin, async (req: Request, res: Response) => {
  try {
    if (new Date(req.body.finish_date) < new Date(req.body.start_date)) {
      res.status(400).json({ error: 'Finish date cannot be earlier than start date' });
      return;
    }
    const [updated] = await Projects.update(req.body, {
      where: { id: Number(req.params.id) },
    });
    res.json({ updated });
  } catch (err) {
    res.status(500).json({ error: 'Error updating project' });
  }
});

// Delete project
router.delete('/projects/:id', authenticateJWT, isadmin, async (req: Request, res: Response) => {
try {
    const project = await Projects.findByPk(Number(req.params.id));
    if (!project) {
       res.status(404).json({ error: 'Project not found' });
       return;
    }

    await project.destroy();
    res.json({ message: 'Project and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting project' });
  }
});

// Get User's projects
router.get('/project/user/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId || isNaN(userId)) {
       res.status(400).json({ message: 'Invalid userId' });
       return;
    }

  try {
    const userRequesting = await Users.findByPk(userId);

    if (!userRequesting) {
       res.status(404).json({ error: 'Requesting user not found' });
       return;
    }

if (!userRequesting.isAdmin && userId !== Number(id)) {
       res.status(403).json({ message: 'Forbidden: You can only access your own projects.' });
       return;
    }

    const user = await Users.findByPk(id, {
      include: [{
        model: Projects,
        as: 'projects', 
        attributes: ['id','project_name'], 
        through: { attributes: [] },
      }],
    });

    if (!user) {
       res.status(404).json({ error: 'User not found' });
       return;
    }

    res.json(user.projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;