import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/db.js';

// Define Task attributes
interface TasksAttributes {
  id: number;
  user_id: number;
  task_name: string;
  description?: string;
  status: 'open' | 'inprogress' | 'done';
  projects_id: number;
  start_date: Date;
  finish_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Define optional fields for creation
interface TaskCreationAttributes extends Optional<TasksAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

class Tasks extends Model<TasksAttributes, TaskCreationAttributes> implements TasksAttributes {
  public id!: number;
  public user_id!: number;
  public task_name!: string;
  public description?: string;
  public status!: 'open' | 'inprogress' | 'done';
  public projects_id!: number;
  public start_date!: Date;
  public finish_date!: Date;
  public created_at?: Date;
  public updated_at?: Date;
}

Tasks.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  task_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  status: {
  type: DataTypes.ENUM('open', 'inprogress', 'done'),
  defaultValue: 'open',
  allowNull: false,
},
  projects_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  finish_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isAfterStartDate(value: Date) {
        if (this.start_date && value < this.start_date) {
          throw new Error('Finish date cannot be earlier than start date');
        }
      }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at', 
});

export default Tasks;