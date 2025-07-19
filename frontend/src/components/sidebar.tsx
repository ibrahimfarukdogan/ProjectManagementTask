import React from 'react';
import styles from './sidebar.module.css';
import people from "/people.svg";
import file from "/file.svg";
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
}
export default function Sidebar({ isOpen }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
            <div className={`${styles.sidebarcontent}`}>
                <button className={`${styles.buttonnormal} ${location.pathname === '/' ? styles.buttonactive : ''}`}
                onClick={() => navigate('/')}>
                    <img src={people} />
                    <h4>USERLIST MANAGEMENT</h4>
                </button>
                <button className={`${styles.buttonnormal} ${location.pathname === '/adminprojects' ? styles.buttonactive : ''}`}
                onClick={() => navigate('/adminprojects')}>
                    <img src={file} />
                    <h4>PROJECT MANAGEMENT</h4>
                </button>
            </div>
        </div>
    );
}
