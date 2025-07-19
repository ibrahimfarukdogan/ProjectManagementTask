import express from 'express';
import userRoutes from './routes/users.routes.js';
import projectRoutes from './routes/projects.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import authRouter from './routes/auth.routes.js';
import sequelize from './db/db.js';
import dotenv from 'dotenv';
import './models/index.js'; 
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js'; 
import cors from 'cors'

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // or use process.env.FRONTEND_ORIGIN
  credentials: true,
}));

app.use(express.json());
app.use('/api', userRoutes); 
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/login', authRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    //await sequelize.sync({ alter: true });
    //console.log('All models synced, join tables created');

    app.listen(process.env.PORT , () => {
      console.log(`Server is running on port ${process.env.PORT }`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();

export default app;