import axios from 'axios';
import type { NewUser } from '../types/user';
import type { NewProject } from '../types/project';
import type { NewTask, Task } from '../types/task';
import { getUserFromToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to headers for all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username:string, password:string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    console.log('Login successful:', response.data);
    localStorage.setItem('token', response.data.token); // Save the token to localStorage
    return response.data; // Return the response data
  } catch (error: any) {
    console.error('Error during login:', error.response ? error.response.data : error.message);
    throw new Error('Invalid email or password'); // Throw error to be caught by the caller
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};


export const getUsers = async () => {
  try {
    const response = await API.get('/api/user');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw new Error('Error fetching users');
  }
};
export const postUser = async (newUser: NewUser) => {
  try {
    const response = await API.post(`/api/user`,  newUser );
    console.log('User added:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error adding user:', error.response ? error.response.data : error.message);
    throw new Error('Failed to add user');
  }
};
export const putUser = async (id:number, newUser: NewUser) => {
  try {
    const response = await API.put(`/api/user/${id}`,  newUser );
    console.log('User updated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating user:', error.response ? error.response.data : error.message);
    throw new Error('Failed to update user');
  }
};
export const deleteUser = async (id: number) => {
  try {
    const response = await API.delete(`/api/user/${id}`);
    console.log('User deleted:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting user:', error.response ? error.response.data : error.message);
    throw new Error('Failed to delete user');
  }
};


export const getProjects = async () => {
  try {
    const response = await API.get('/api/projects');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching projects:', error.response?.data || error.message);
    throw new Error('Error fetching projects');
  }
};
export const getProjectsByMemberId = async () => {
  try {
    const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
    const user = getUserFromToken(token);
      if (!user) {
        console.error('Invalid token');
        return;
      }
    const response = await API.get(`/api/project/user/${user.id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching projects:', error.response?.data || error.message);
    throw new Error('Error fetching projects');
  }
};
export const postProject = async (newProject: NewProject) => {
  try {
    const response = await API.post(`/api/projects`,  newProject );
    console.log('Project  added:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error adding project:', error.response ? error.response.data : error.message);
    throw new Error('Failed to add project');
  }
};
export const putProject = async (id:number, newProject: NewProject) => {
  try {
    const response = await API.put(`/api/projects/${id}`,  newProject );
    console.log('Project updated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating Project:', error.response ? error.response.data : error.message);
    throw new Error('Failed to update Project');
  }
};
export const deleteProject = async (id: number) => {
  try {
    const response = await API.delete(`/api/projects/${id}`);
    console.log('Project deleted:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting Project:', error.response ? error.response.data : error.message);
    throw new Error('Failed to delete Project');
  }
};

export const getProjectMembers = async (projectId: number) => {
  try {
    const response = await API.get(`/api/project/userpage/user`, {
      params: { projectId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching project members:', error.response?.data || error.message);
    throw new Error('Error fetching project members');
  }
};
export const postProjectMember = async (projectId: number, userId: number) => {
  try {
    const response = await API.post(`/api/projects/${projectId}`, { userId });
    return response.data;
  } catch (error: any) {
    console.error('Error adding project member:', error.response?.data || error.message);
    throw new Error('Failed to add project member');
  }
};
export const deleteProjectMember = async (projectId: number, userId: number) => {
  try {
    const response = await API.delete(`/api/projects/user/${userId}`, {
      params: { projectId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error removing project member:', error.response?.data || error.message);
    throw new Error('Failed to remove project member');
  }
};
export const getTasksByProjectId = async (id: number): Promise<Task[]> => {
  try {
    const response = await API.get(`/api/projects/tasks`, {
      params: { id: id }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to get tasks:', error.response?.data || error.message);
    throw new Error('Failed to get tasks');
  }
};
export const postTask = async (newTask: NewTask) => {
  try {
    const response = await API.post(`/api/project/tasks`, newTask);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create task:', error.response?.data || error.message);
    throw new Error('Failed to create task');
  }
};
export const putTask = async (id: number, newTask: NewTask) => {
  try {
    const response = await API.put(`/api/tasks/${id}`, newTask);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update task:', error.response?.data || error.message);
    throw new Error('Failed to update task');
  }
};
export const putTaskStatus = async (id:number, taskid: number, status: 'open' | 'inprogress' | 'done') => {
  try {
    const response = await API.put(`/api/tasks/user/${id}`, {status}, {params: { task_id: taskid }});
    return response.data;
  } catch (error: any) {
    console.error('Failed to update task:', error.response?.data || error.message);
    throw new Error('Failed to update task');
  }
};
export const deleteTask = async (id: number) => {
  try {
    const response = await API.delete(`/api/project/tasks/${id}`);
    console.log('task deleted:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting task:', error.response ? error.response.data : error.message);
    throw new Error('Failed to delete task');
  }
};

export default API;