import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import sequelize from '../db/db.js';
import Users from './users.model.js';
import Tasks from './tasks.model.js';

class Projects extends Model<
  InferAttributes<Projects, { omit: 'members' }>,
  InferCreationAttributes<Projects, { omit: 'members' }>
> {
  declare id: CreationOptional<number>;
  declare project_name: string;
  declare start_date: Date;
  declare finish_date: Date;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare members?: NonAttribute<Users[]>;

  declare getMembers: () => Promise<Users[]>;
  declare addMember: (user: Users | number) => Promise<void>;
  declare addMembers: (users: Users[] | number[]) => Promise<void>;
  declare removeMember: (user: Users | number) => Promise<void>;
  declare hasMember: (user: Users | number) => Promise<boolean>;

  // You can also optionally define the association itself:
  static associations: {
    members: Association<Projects, Users>;
  };
}

Projects.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  project_name: {
    type: DataTypes.STRING,
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
  modelName: 'Project',
  tableName: 'projects',
  hooks: {
    beforeDestroy: async (project, options) => {
      await Tasks.destroy({
        where: { projects_id: project.id },
        transaction: options.transaction // ensures atomicity if transaction is used
      });
    },
  },
  timestamps: true, // <- this enables createdAt and updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Projects;
