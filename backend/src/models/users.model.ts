import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/db.js';
import bcrypt from 'bcrypt';
import Tasks from './tasks.model.js';

interface UserAttributes {
  id: number;
  username: string;
  name?: string;
  password: string;
  mail?: string;
  isAdmin?: boolean;
  created_at?: Date;
}

// Define creation attributes (id and created_at optional when creating)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at'> { }

class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public name?: string;
  public password!: string;
  public mail?: string;
  public isAdmin?: boolean;
  public created_at?: Date;
  public projects?: any[]; 
}

Users.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
  ,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'Users',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeDestroy: async (user, options) => {
      await Tasks.destroy({
        where: { user_id: user.id },
        transaction: options.transaction // ensures atomicity if transaction is used
      });
    },
  },
  
  timestamps: true,
  createdAt: 'created_at',
});


export default Users;