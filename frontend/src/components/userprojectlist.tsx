

import React, { useEffect, useState } from 'react'
import styles from './userprojectlist.module.css';
import { getProjectsByMemberId } from '../services/api';
import file2 from "/file2.svg";
import type { Project } from '../types/project';
import { useNavigate } from 'react-router-dom';


export default function userprojectlist() {
    const [projects, setProjects] = useState<Project[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
    const getProjectsall = async () => {
        try {
            const items = await getProjectsByMemberId(/*needs user id*/ );
            setProjects(items);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

        getProjectsall();
    }, []);


    const truncate = (str: string, max: number) =>
        str.length > max ? str.slice(0, max) + '...' : str;

    return (
        <div className={`${styles.base}`}>

            <div className={`${styles.header}`}>
                <h2>Projects</h2>
            </div>
            <div className={styles.userlist}>
                <div className={styles.userheader}>
                    <span>Number</span>
                    <span>Project Name</span>
                    <span>Details</span>
                </div>

                {[...projects].reverse().map((project: Project, index: number) => (
                    <div key={project.id} className={styles.useritem}>
                        <span>{projects.length - index}</span>
                        <span>{truncate(project.project_name, 10)}</span>
                        <div className={styles.modaladduserdetailbuttonarea}><button
                            onClick={() => navigate(`/userprojects/${project.id}`,
                                { state: { projectName: project.project_name }, })}>
                            <img src={file2} /></button></div>
                    </div>
                ))}
            </div>

        </div>
    )
}
