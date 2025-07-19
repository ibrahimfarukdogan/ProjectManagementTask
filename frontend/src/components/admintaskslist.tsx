import React, { useEffect, useState } from 'react'
import styles from './admintaskslist.module.css';
import { deleteTask, getProjectMembers, getTasksByProjectId, postTask, putTask } from '../services/api';
import type { NewTask, Task } from '../types/task';
import trashbtn from "/trashbtn.svg";
import editbtn from "/editbtn.svg";
import cross2 from "/cross2.svg";
import { useLocation, useParams } from 'react-router-dom';
import type { User } from '../types/user';

export default function admintaskslist() {

  const { id } = useParams(); // project ID from URL
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false); //hook, setter, initial state value
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const location = useLocation();
  const projectName = location.state?.projectName;
  const validStatuses = ['open', 'inprogress', 'done'] as const;
  const [formData, setFormData] = useState<{ task_name: string, description: string, status: 'open' | 'inprogress' | 'done', start_date: string, finish_date: string, user_id: number }>
    ({ task_name: '', description: '', status: 'open', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0], user_id: 0 });


  const getTasksall = async () => {
    if (!id) return;
    try {
      const taskData = await getTasksByProjectId(Number(id));
      setTasks(taskData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getProjectMembers(Number(id)); // You need to have a getUsers() in api.ts
        setMembers(response);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    getTasksall();
    fetchMembers();
  }, []);

  const truncate = (str: string, max: number) =>
    str.length > max ? str.slice(0, max) + '...' : str;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'user_id' ? Number(value) : value,
    }));
  };

  const assignedUserIds = new Set(tasks.map((t) => t.user_id));
  const availableMembers = members.filter((member) => !assignedUserIds.has(member.id));
  const selectedUser = members.find(u => u.id === formData.user_id);
  const fullUserList = availableMembers.concat(selectedUser && !availableMembers.some(u => u.id === selectedUser.id) ? [selectedUser] : []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!formData.task_name || !formData.description || !validStatuses.includes(formData.status) || !formData.start_date || !formData.finish_date || !formData.user_id) {
      console.error('Some credentials are missing');
      return;
    }

    try {
      const postproject: NewTask = {
        task_name: formData.task_name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        finish_date: formData.finish_date,
        user_id: formData.user_id,
        projects_id: Number(id),
      }
      await postTask(postproject);
      await getTasksall();
      setFormData({ task_name: '', description: '', status: 'open', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0], user_id: 0 });
      setShowAddModal(false);

    } catch (error: any) {
      console.error(error.message || 'Creating User failed');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!formData.task_name || !formData.description || !validStatuses.includes(formData.status) || !formData.start_date || !formData.finish_date || !formData.user_id) {
      console.error('Some credentials are missing');
      return;
    }
    try {
      const postproject: NewTask = {
        task_name: formData.task_name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        finish_date: formData.finish_date,
        user_id: formData.user_id,
        projects_id: Number(id),
      }
      console.log(postproject);
      await putTask(selectedTask!.id, postproject);
      await getTasksall();
      setFormData({ task_name: '', description: '', status: 'open', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0], user_id: 0 });
      setShowUpdateModal(false);
      setSelectedTask(null);
    } catch (error: any) {
      console.error(error.message || 'Update User failed');
    }
  };

  const DeleteProject = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      await getTasksall();
      setShowDeleteModal(false);
      setSelectedTask(null);
    } catch (error: any) {
      console.error(error.message || 'Delete User failed');
    }
  };

  return (
    <div className={`${styles.base}`}>
      <div className={`${styles.header}`}>
        {projectName && <h2>{projectName}</h2>}
        <button onClick={() => setShowAddModal(true)}> <div className={styles.buttontext}><div className={styles.separator}>Add task</div><span>+</span></div></button>
      </div>
      <div className={styles.userlist}>
        <div className={styles.userheader}>
          <span>ID</span>
          <span>USER</span>
          <span>TASK</span>
          <span>DESCRIPTION</span>
          <span>STATUS</span>
          <span>STARTED</span>
          <span>FINISH</span>
          <span>EDIT</span>
        </div>

        {tasks.map((task: Task) => (
          <div key={task.id} className={styles.useritem}>
            <span>{task.id}</span>
            <span>{truncate(task.User?.name || '', 10)}</span>
            <span>{truncate(task.task_name ?? '', 10)}</span>
            <span>{truncate(task.description ?? '', 10)}</span>
            <span className={
    task.status === 'open'
      ? styles.statusOpen
      : task.status === 'inprogress'
      ? styles.statusInProgress
      : styles.statusDone
  }>{task.status}</span>
            <span>{new Date(task.start_date).toLocaleDateString()}</span>
            <span>{new Date(task.finish_date).toLocaleDateString()}</span>
            <div className={styles.useritembtnarea}>
              <button onClick={() => {
                setSelectedTask(task);
                setFormData({
                  task_name: task.task_name,
                  description: task.description ?? '',
                  status: task.status,
                  start_date: new Date(task.start_date).toISOString().split('T')[0],
                  finish_date: new Date(task.finish_date).toISOString().split('T')[0],
                  user_id: task.user_id,
                });
                setShowUpdateModal(true);
              }}>
                <img src={editbtn} />
              </button>
              <button onClick={() => {
                setSelectedTask(task);
                setShowDeleteModal(true);
              }}>
                <img src={trashbtn} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {
        showAddModal && (
          <>
            <div className={`${styles.overlay}`} onClick={() => setShowAddModal(false)} />
            <div className={`${styles.modaladduser}`} onClick={(e) => e.stopPropagation()}>
              <div className={`${styles.modaladduserheader}`}><h2>ADD TASK</h2><button onClick={() => setShowAddModal(false)} ><img src={cross2} /></button></div>
              <hr />
              <form onSubmit={handleCreateSubmit}>
                <div className={`${styles.modalupdateuserform}`}>
                  <label className={`${styles.modalupdateuserformlabel}`}>Task Name</label>
                  <input style={{ marginBottom: '5px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.task_name ? styles.inputError : ''}`}
                    type="text" name="task_name" placeholder="TaskName*" value={formData.task_name} onChange={handleInputChange} />
                  <label className={`${styles.modalupdateuserformlabel}`}>Description</label>
                  <input style={{ marginBottom: '5px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.description ? styles.inputError : ''}`}
                    type="text" name="description" placeholder="Description*" value={formData.description} onChange={handleInputChange} />
                  <label className={`${styles.modalupdateuserformlabel}`}>Started Time</label>
                  <input style={{ marginBottom: '5px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.start_date ? styles.inputError : ''}`}
                    type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                  <label className={`${styles.modalupdateuserformlabel}`}>Finish Time</label>
                  <input style={{ marginBottom: '10px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.finish_date ? styles.inputError : ''}`}
                    type="date" name="finish_date" value={formData.finish_date} onChange={handleInputChange} />
                  <div className={`${styles.selectarea}`}>
                    <label className={`${styles.selectlabel}`}>Status: </label>
                    <select name="status" value={formData.status} onChange={handleSelectChange}>
                      <option value='open'>open</option>
                      <option value='inprogress'>inprogress</option>
                      <option value='done'>done</option>
                    </select>
                  </div>
                  <div className={`${styles.selectarea}`}>
                    <label className={`${styles.selectlabel}`}>User ID: </label>
                    <select name="user_id" value={formData.user_id} onChange={handleSelectChange}>
                      <option value="">Choose one</option>
                      {availableMembers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {truncate(user.id + ": " + user.username, 12)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`${styles.modaladduserbuttonarea}`}>
                  <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit">Add</button>
                </div>
              </form>
            </div>
          </>
        )
      }
      {
        showUpdateModal && (
          <>
            <div className={`${styles.overlay}`} onClick={() => setShowUpdateModal(false)} />
            <div className={`${styles.modaladduser}`} onClick={(e) => e.stopPropagation()}>
              <div className={`${styles.modaladduserheader}`}><h2>EDIT TASK</h2><button onClick={() => setShowUpdateModal(false)} ><img src={cross2} /></button></div>
              <hr />
              <form onSubmit={handleUpdateSubmit}>
                <div className={`${styles.modalupdateuserform}`}>
                  <label className={`${styles.modalupdateuserformlabel}`}>Task Name</label>
                  <input style={{ marginBottom: '5px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.task_name ? styles.inputError : ''}`}
                    type="text" name="task_name" placeholder="TaskName*" value={formData.task_name} onChange={handleInputChange} />
                  <label className={`${styles.modalupdateuserformlabel}`}>Description</label>
                  <input style={{ marginBottom: '5px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.description ? styles.inputError : ''}`}
                    type="text" name="description" placeholder="Description*" value={formData.description} onChange={handleInputChange} />
                  <label className={`${styles.modalupdateuserformlabel}`}>Started Time</label>
                  <input style={{ marginBottom: '5px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.start_date ? styles.inputError : ''}`}
                    type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                  <label className={`${styles.modalupdateuserformlabel}`}>Finish Time</label>
                  <input style={{ marginBottom: '10px' }}
                    className={`${styles.modaladduserforminput} ${submitted && !formData.finish_date ? styles.inputError : ''}`}
                    type="date" name="finish_date" value={formData.finish_date} onChange={handleInputChange} />
                  <div className={`${styles.selectarea}`}>
                    <label className={`${styles.selectlabel}`}>Status: </label>
                    <select name="status" value={formData.status} onChange={handleSelectChange}>
                      <option value='open'>open</option>
                      <option value='inprogress'>inprogress</option>
                      <option value='done'>done</option>
                    </select>
                  </div>
                  <div className={`${styles.selectarea}`}>
                    <label className={`${styles.selectlabel}`}>User ID: </label>
                    <select name="user_id" value={formData.user_id} onChange={handleSelectChange}>
                      <option value="">Choose one</option>
                      {fullUserList.map((user) => (
                        <option key={user.id} value={user.id}>
                          {truncate(user.id + ": " + user.username, 12)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={`${styles.modaladduserbuttonarea}`}>
                  <button type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                  <button type="submit">Confirm</button>
                </div>
              </form>
            </div>
          </>
        )
      }
      {
        showDeleteModal && (
          <>
            <div className={`${styles.overlay}`} onClick={() => setShowDeleteModal(false)} />
            <div className={`${styles.modaldeleteuser}`} onClick={(e) => e.stopPropagation()}>
              <div className={`${styles.modaldeleteuserheader}`}><button className={`${styles.modaldeleteuserheaderbutton}`} onClick={() => setShowDeleteModal(false)} ><img src={cross2} /></button></div>
              <h5 className={`${styles.modaldeleteuserh5}`}>Are you sure you want to delete {selectedTask?.task_name}?</h5>
              <div className={`${styles.modaldeleteuserbuttonarea}`}>
                <button type="button" onClick={() => setShowDeleteModal(false)}>No</button>
                <button type="button" onClick={DeleteProject}>Yes</button>
              </div>
            </div>
          </>
        )
      }

    </div>
  );
}