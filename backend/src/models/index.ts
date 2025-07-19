import Users from './users.model.js';
import Projects from './projects.model.js';
import Tasks from './tasks.model.js';

Tasks.belongsTo(Users, { foreignKey: 'user_id' });
Tasks.belongsTo(Projects, { foreignKey: 'projects_id' });

Users.belongsToMany(Projects, {
  through: 'projects_members',
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects',
});

Projects.belongsToMany(Users, {
  through: 'projects_members',
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members',
});

export {
  Users,
  Projects,
  Tasks,
};