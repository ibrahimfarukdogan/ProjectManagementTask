import React, { useEffect, useState } from 'react'
import styles from './adminuserslist.module.css';
import { getUsers, postUser, putUser, deleteUser } from '../services/api';
import type { NewUser, User } from '../types/user';
import trashbtn from "/trashbtn.svg";
import editbtn from "/editbtn.svg";
import cross2 from "/cross2.svg";

export default function Adminuserslist() {
    const [members, setMembers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<{ username: string; name: string, password: string, mail: string, isAdmin: boolean }>({ username: '', name: '', password: '', mail: '', isAdmin: false });

    const getMembers = async () => {
        try {
            const items = await getUsers();
            setMembers(items);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    useEffect(() => {
        getMembers();
    }, []);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            isAdmin: e.target.value === 'true',
        }));
    };

    const truncate = (str: string, max: number) =>
        str.length > max ? str.slice(0, max) + '...' : str;


    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!formData.username || !formData.password || !formData.name || !formData.mail) {
            console.error('Some credentials are missing');
            return;
        }

        try {
            const postuser: NewUser = {
                username: formData.username,
                name: formData.name,
                password: formData.password,
                mail: formData.mail,
                isAdmin: formData.isAdmin,
            }
            await postUser(postuser);
            await getMembers();
            setFormData({ username: '', name: '', password: '', mail: '', isAdmin: false });
            setShowAddModal(false);

        } catch (error: any) {
            console.error(error.message || 'Creating User failed');
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!formData.username || !formData.password || !formData.name || !formData.mail) {
            console.error('Some credentials are missing');
            return;
        }

        try {
            const postuser: NewUser = {
                username: formData.username,
                name: formData.name,
                password: formData.password,
                mail: formData.mail,
                isAdmin: formData.isAdmin,
            }
            await putUser(selectedUser!.id, postuser);
            await getMembers();
            setFormData({ username: '', name: '', password: '', mail: '', isAdmin: false });
            setShowUpdateModal(false);
            setSelectedUser(null);
        } catch (error: any) {
            console.error(error.message || 'Update User failed');
        }
    };

    const DeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser.id);
            await getMembers();
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error: any) {
            console.error(error.message || 'Delete User failed');
        }
    };

    
    return (
        <div className={`${styles.base}`}>
            <div className={`${styles.header}`}>
                <h2>Userlist Management</h2>
                <button onClick={() => setShowAddModal(true)}> <div className={styles.buttontext}><div className={styles.separator}>Add New User</div><span>+</span></div></button>
            </div>
            <div className={styles.userlist}>
                <div className={styles.userheader}>
                    <span>ID</span>
                    <span>Username</span>
                    <span>Name</span>
                    <span>Mail</span>
                    <span>isAdmin</span>
                    <span>Edit</span>
                </div>

                {members.map((user: User) => (
                    <div key={user.id} className={styles.useritem}>
                        <span>{user.id}</span>
                        <span>{truncate(user.username, 10)}</span>
                        <span>{truncate(user.name ?? '', 10)}</span>
                        <span>{truncate(user.mail ?? '', 10)}</span>
                        <span>{user.isAdmin ? 'true' : 'false'}</span>
                        <div className={styles.useritembtnarea}>
                            <button onClick={() => {
                                setSelectedUser(user);
                                setFormData({
                                    username: user.username,
                                    name: user.name ?? '',
                                    password: '',
                                    mail: user.mail ?? '',
                                    isAdmin: user.isAdmin ? true : false,
                                });
                                setShowUpdateModal(true);
                            }}>
                                <img src={editbtn} />
                            </button>
                            <button onClick={() => {
                                setSelectedUser(user);
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
                            <div className={`${styles.modaladduserheader}`}><h2>ADD USER</h2><button onClick={() => setShowAddModal(false)} ><img src={cross2} /></button></div>
                            <hr />
                            <form onSubmit={handleCreateSubmit}>
                                <div className={`${styles.modaladduserform}`}>
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.username ? styles.inputError : ''}`}
                                        type="text" name="username" placeholder="UserName*" value={formData.username} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.name ? styles.inputError : ''}`}
                                        type="text" name="name" placeholder="Name*" value={formData.name} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '5px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.password ? styles.inputError : ''}`}
                                        type="password" name="password" placeholder="Password*" value={formData.password} onChange={handleInputChange} />
                                    <div><label style={{ marginLeft: '5px' }}>Email*</label></div>
                                    <input style={{ marginBottom: '20px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.mail ? styles.inputError : ''}`}
                                        type="email" name="mail" placeholder="Email*" value={formData.mail} onChange={handleInputChange} />
                                    <div>
                                        <label>IsAdmin: </label>
                                        <select name="isAdmin" value={formData.isAdmin.toString()} onChange={handleSelectChange}>
                                            <option value='true'>true</option>
                                            <option value='false'>false</option>
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
                            <div className={`${styles.modaladduserheader}`}><h2>ADD USER</h2><button onClick={() => setShowUpdateModal(false)} ><img src={cross2} /></button></div>
                            <hr />
                            <form onSubmit={handleUpdateSubmit}>
                                <div className={`${styles.modaladduserform}`}>
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.username ? styles.inputError : ''}`}
                                        type="text" name="username" placeholder="UserName*" value={formData.username} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '30px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.name ? styles.inputError : ''}`}
                                        type="text" name="name" placeholder="Name*" value={formData.name} onChange={handleInputChange} />
                                    <input style={{ marginBottom: '5px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.password ? styles.inputError : ''}`}
                                        type="password" name="password" placeholder="Password*" value={formData.password} onChange={handleInputChange} />
                                    <div><label style={{ marginLeft: '5px' }}>Email*</label></div>
                                    <input style={{ marginBottom: '20px' }}
                                        className={`${styles.modaladduserforminput} ${submitted && !formData.mail ? styles.inputError : ''}`}
                                        type="email" name="mail" placeholder="Email*" value={formData.mail} onChange={handleInputChange} />
                                    <div>
                                        <label>IsAdmin: </label>
                                        <select name="isAdmin" value={formData.isAdmin.toString()} onChange={handleSelectChange}>
                                            <option value='true'>true</option>
                                            <option value='false'>false</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={`${styles.modaladduserbuttonarea}`}>
                                    <button type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                                    <button type="submit">Update</button>
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
                            <h5 className={`${styles.modaldeleteuserh5}`}>Are you sure you want to delete {selectedUser?.username}?</h5>
                            <div className={`${styles.modaldeleteuserbuttonarea}`}>
                                <button type="button" onClick={() => setShowDeleteModal(false)}>No</button>
                                <button type="button" onClick={DeleteUser}>Yes</button>
                            </div>
                        </div>
                    </>
                )
            }

        </div >
    );
}