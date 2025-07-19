import React, { use, useEffect, useState } from 'react'
import styles from './adminprojectslist.module.css';
import { getProjects, postProject, putProject, deleteProject, getProjectMembers, postProjectMember, deleteProjectMember, getUsers } from '../services/api';
import trashbtn from "/trashbtn.svg";
import editbtn from "/editbtn.svg";
import cross2 from "/cross2.svg";
import file2 from "/file2.svg";
import type { NewProject, Project } from '../types/project';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/user';

export default function adminprojectslist() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedMembersId, setSelectedMembersId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<{ project_name: string; start_date: string, finish_date: string }>
        ({ project_name: '', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0] });
    const navigate = useNavigate();

    const getProjectsall = async () => {
        try {
            const items = await getProjects();
            setProjects(items);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await getUsers(); // You need to have a getUsers() in api.ts
                setUsers(response);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            }
        };

        getProjectsall();
        fetchMembers();
    }, []);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const truncate = (str: string, max: number) =>
        str.length > max ? str.slice(0, max) + '...' : str;

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!formData.project_name || !formData.start_date || !formData.finish_date) {
            console.error('Some credentials are missing');
            return;
        }

        try {
            const postproject: NewProject = {
                project_name: formData.project_name,
                start_date: formData.start_date,
                finish_date: formData.finish_date,
            }
            await postProject(postproject);
            await getProjectsall();
            setFormData({ project_name: '', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0] });
            setShowAddModal(false);

        } catch (error: any) {
            console.error(error.message || 'Creating User failed');
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!formData.project_name || !formData.start_date || !formData.finish_date) {
            console.error('Some credentials are missing');
            return;
        }
        try {
            const postproject: NewProject = {
                project_name: formData.project_name,
                start_date: formData.start_date,
                finish_date: formData.finish_date,
            }
            console.log(postproject);
            await putProject(selectedProject!.id, postproject);
            await getProjectsall();
            setFormData({ project_name: '', start_date: new Date().toISOString().split('T')[0], finish_date: new Date().toISOString().split('T')[0] });
            setShowUpdateModal(false);
            setSelectedProject(null);
        } catch (error: any) {
            console.error(error.message || 'Update User failed');
        }
    };

    const DeleteProject = async () => {
        if (!selectedProject) return;
        try {
            await deleteProject(selectedProject.id);
            await getProjectsall();
            setShowDeleteModal(false);
            setSelectedProject(null);
        } catch (error: any) {
            console.error(error.message || 'Delete User failed');
        }
    };

    const addMember = async () => {
        if (!selectedProject || selectedMembersId === null) return;
        try {
            await postProjectMember(selectedProject.id, selectedMembersId);
            const updatedMembers = await getProjectMembers(selectedProject.id);
            setMembers(updatedMembers);
            setSelectedMembersId(null); // reset
        } catch (err) {
            console.error('Failed to add member:', err);
        }
    };

    const DeleteMember = async (userId: number) => {
        if (!selectedProject) return;
        try {
            await deleteProjectMember(selectedProject.id, userId);
            const updatedMembers = await getProjectMembers(selectedProject.id);
            setMembers(updatedMembers);
        } catch (err) {
            console.error('Failed to delete member:', err);
        }
    };


    return (
        <div className={`${styles.base}`}>

            <div className={`${styles.header}`}>
                <h2>Projects List</h2>
                <button onClick={() => setShowAddModal(true)}> <div className={styles.buttontext}><div className={styles.separator}>Create Project</div><span>+</span></div></button>
            </div>
            <div className={styles.userlist}>
                <div className={styles.userheader}>
                    <span>ID</span>
                    <span>PROJECT NAME</span>
                    <span>START DATE</span>
                    <span>FINISH DATE</span>
                    <span>DETAIL</span>
                    <span>EDIT</span>
                </div>

                {projects.map((project: Project) => (
                    <div key={project.id} className={styles.useritem}>
                        <span>{project.id}</span>
                        <span>{truncate(project.project_name, 10)}</span>
                        <span>{new Date(project.start_date).toISOString().split('T')[0]}</span>
                        <span>{new Date(project.finish_date).toISOString().split('T')[0]}</span>
                        <div className={styles.modaladduserdetailbuttonarea}><button
                            onClick={() => navigate(`/adminprojects/${project.id}`,
                                { state: { projectName: project.project_name }, })}>
                            <img src={file2} /></button></div>
                        <div className={styles.useritembtnarea}>
                            <button onClick={async () => {
                                setSelectedProject(project);
                                setFormData({
                                    project_name: project.project_name,
                                    start_date: new Date(project.start_date).toISOString().split('T')[0],
                                    finish_date: new Date(project.finish_date).toISOString().split('T')[0],
                                });
                                try {
                                    const members = await getProjectMembers(project.id);
                                    setMembers(members);
                                } catch (err) {
                                    console.error('Failed to fetch project members:', err);
                                }
                                setShowUpdateModal(true);
                            }}>
                                <img src={editbtn} />
                            </button>
                            <button onClick={() => {
                                setSelectedProject(project);
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
                            <div className={`${styles.modaladduserheader}`}><h2>ADD PROJECT</h2><button onClick={() => setShowAddModal(false)} ><img src={cross2} /></button></div>
                            <hr />
                            <form onSubmit={handleCreateSubmit}>
                                <div className={`${styles.modaladduserform}`}>
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.project_name ? styles.inputError : ''}`}
                                        type="text" name="project_name" placeholder="ProjectName*" value={formData.project_name} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.project_name ? styles.inputError : ''}`}
                                        type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.finish_date ? styles.inputError : ''}`}
                                        type="date" name="finish_date" value={formData.finish_date} onChange={handleInputChange} />
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
                            <div className={`${styles.modaladduserheader}`}><h2>PROJECT EDIT</h2><button onClick={() => setShowUpdateModal(false)} ><img src={cross2} /></button></div>
                            <hr />
                            <form onSubmit={handleUpdateSubmit}>
                                <div className={`${styles.modalupdateuserform}`}>
                                    <label className={`${styles.modalupdateuserformlabel}`}>Project Name</label>
                                    <input style={{ marginBottom: '10px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.project_name ? styles.inputError : ''}`}
                                        type="text" name="project_name" placeholder="ProjectName*" value={formData.project_name} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '10px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.start_date ? styles.inputError : ''}`}
                                        type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '10px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.finish_date ? styles.inputError : ''}`}
                                        type="date" name="finish_date" value={formData.finish_date} onChange={handleInputChange} />
                                    <h5>ADD USER</h5>
                                    <div className={styles.modalupdateuserformbtnarea}>
                                        <select value={selectedMembersId ?? ''} onChange={(e) => setSelectedMembersId(Number(e.target.value))}>
                                            <option value="">Choose one</option>
                                            {users
                                                .filter(user => !members.some(member => member.id === user.id))
                                                .map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {truncate(user.id + ": " + user.name, 12)}
                                                    </option>
                                                ))}
                                        </select>
                                        <button className={`${styles.modalupdateuserformaddbtn}`} type="button" onClick={async () => addMember()}>+</button>
                                    </div>
                                    <div className={styles.upduserlist}>
                                        <div className={styles.upduserheader}>
                                            <span>id</span>
                                            <span>Name</span>
                                            <span>Delete</span>
                                        </div>

                                        {members.map((user: User) => (
                                            <div key={user.id} className={styles.upduseritem}>
                                                <span>{user.id}</span>
                                                <span>{truncate(user.name ?? '', 10)}</span>
                                                <div className={styles.modaladduserdetailbuttonarea}>
                                                    <button type="button" onClick={async () => DeleteMember(user.id)}><img src={trashbtn} /></button>
                                                </div>
                                            </div>
                                        ))}
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
                            <h5 className={`${styles.modaldeleteuserh5}`}>Are you sure you want to delete {selectedProject?.project_name}?</h5>
                            <div className={`${styles.modaldeleteuserbuttonarea}`}>
                                <button type="button" onClick={() => setShowDeleteModal(false)}>No</button>
                                <button type="button" onClick={DeleteProject}>Yes</button>
                            </div>
                        </div>
                    </>
                )
            }



        </div>
    )
}
