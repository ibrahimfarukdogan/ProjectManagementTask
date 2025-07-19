import express from 'express';
import { Request, Response } from 'express';
import Users from '../models/users.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
   const { username, password } = req.body;

  try {
    // Find user by username
    const user = await Users.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
  console.error('Login error:', error); // 👈 Bu satırı ekle
  res.status(500).json({ message: 'Server error' });
}
});

export default router;