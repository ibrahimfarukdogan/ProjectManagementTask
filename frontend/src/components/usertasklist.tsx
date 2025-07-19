import React, { useEffect, useState } from 'react'
import styles from './usertasklist.module.css';
import { getTasksByProjectId, putTaskStatus } from '../services/api';
import type { Task } from '../types/task';
import file2 from "/file2.svg";
import file3 from "/file3.svg";
import cross2 from "/cross2.svg";
import { useParams } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

export default function usertasklist() {

  const { id } = useParams(); // project ID from URL
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<number>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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

  const getUserWithToken = () => {
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
    setUserId(user.id);
  };
  useEffect(() => {
    getTasksall();
    getUserWithToken();
  }, []);

  const truncate = (str: string, max: number) =>
    str.length > max ? str.slice(0, max) + '...' : str;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      status: value as 'open' | 'inprogress' | 'done'
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validStatuses.includes(formData.status)) {
      console.error('Some credentials are missing');
      return;
    }
    try {
      if (!userId) {
        console.error('Invalid token');
        return;
      }
      await putTaskStatus(userId, selectedTask!.id, formData.status);
      await getTasksall();

      setFormData({ task_name: '', description: '', status: 'open', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0], user_id: 0 });
      setShowUpdateModal(false);
      setSelectedTask(null);
    } catch (error: any) {
      console.error(error.message || 'Update User failed');
    }
  };

  return (
    <div className={`${styles.base}`}>
      <div className={`${styles.header}`}>
        <h2>Taskslist</h2>
      </div>
      <div className={styles.userlist}>
        <div className={styles.userheader}>
          <span>Task Name</span>
          <span>Description</span>
          <span>status</span>
          <span>Details</span>
        </div>

        {tasks.map((task: Task) => (
          <div key={task.id} className={styles.useritem}>
            <span>{truncate(task.task_name ?? '', 10)}</span>
            <span>{truncate(task.description ?? '', 10)}</span>
            <span className={
              task.status === 'open'
                ? styles.statusOpen
                : task.status === 'inprogress'
                  ? styles.statusInProgress
                  : styles.statusDone
            }>{task.status}</span>
            <div className={styles.modaladduserdetailbuttonarea}>
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
                <img src={task.user_id === userId ? file3 : file2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {
        showUpdateModal && (
          <>
            <div className={`${styles.overlay}`} onClick={() => setShowUpdateModal(false)} />
            <div className={`${styles.modaladduser}`} onClick={(e) => e.stopPropagation()}>
              <div className={`${styles.modaladduserheader}`}><button onClick={() => setShowUpdateModal(false)} ><img src={cross2} /></button></div>
              <form onSubmit={handleUpdateSubmit}>

                <div className={`${styles.modalupdateuserform}`}>
                  <div className={`${styles.modalupdatedescfield}`}>
                    <h3>{truncate(formData.task_name ?? '', 10)}</h3>
                    <label>Description:</label>
                    <div className={`${styles.textBox}`}>{formData.description ?? ''}</div>
                  </div>

                  <div className={styles.verticalLine}></div>

                  <div className={`${styles.modalupdateselectfield}`}>
                    <label>Started Time: {new Date(formData.start_date).toLocaleDateString()}</label>
                    <label>Finish Time: {new Date(formData.finish_date).toLocaleDateString()}</label>

                    <div>
                      <label>Status: </label>
                      <span className={
                        formData.status === 'open'
                          ? styles.statusOpen
                          : formData.status === 'inprogress'
                            ? styles.statusInProgress
                            : styles.statusDone
                      }>{formData.status}</span>
                    </div>
                    <div className={`${styles.selectwidth}`}>
                    {formData.user_id === userId && (
                      <div className={`${styles.selectarea}`}>
                        <select name="status" value={formData.status} onChange={handleSelectChange}>
                          <option value="">Choose one</option>
                          <option value='open'>open</option>
                          <option value='inprogress'>inprogress</option>
                          <option value='done'>done</option>
                        </select>
                        <button className={`${styles.submitbtn}`} type="submit">CHANGE</button>
                      </div>
                    )}
                    </div>
                  </div>
                </div>

              </form>
            </div>
          </>
        )
      }

    </div>
  );
}