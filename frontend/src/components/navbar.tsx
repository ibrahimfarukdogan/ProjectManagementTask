import React, { useEffect, useState } from 'react'
import { logout } from '../services/api'
import Sidebar from '../components/sidebar'
import styles from './navbar.module.css';
import threedot from "/threedot.svg";
import cross1 from "/cross1.svg";
import logoutt from "/logout.svg"
import { getUserFromToken } from '../utils/auth';

interface NavbarProps {
    adminUser: boolean
}

export default function Navbar({ adminUser }: NavbarProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = getUserFromToken(token);
      setUsername(user?.username ?? null);
    }
  }, []);
    return (
        <>
            <nav className={`${styles.base}`}>
                <div className={`${styles.leftside}`}>
                <div className={`${styles.menubuttondiv}`}>

                    {adminUser && (
                        <button className={`${styles.menubutton}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <img src={cross1} /> : <img src={threedot} />}
                        </button>
                    )}
                </div>
                    <h1>Welcome {username  ? username : 'user'}</h1>
                </div>
                <button className={`${styles.logoutbutton}`} onClick={logout}><img src={logoutt} /></button>

            </nav>

            <Sidebar isOpen={sidebarOpen} />
            {sidebarOpen && (
                <div className={`${styles.overlay}`} onClick={() => setSidebarOpen(false)} />
            )}
        </>
    )
}
