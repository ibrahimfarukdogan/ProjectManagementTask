import React, { useEffect, useState, type ChangeEvent } from 'react'
import styles from './loginpage.module.css';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { isTokenValid, getUserFromToken } from '../utils/auth';

export default function Loginpage() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<{ username: string; password: string }>({ username: '', password: '' });


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && isTokenValid(token)) {
            const user = getUserFromToken(token);
            if (user?.isAdmin) {
                navigate('/');
            } else {
                navigate('/userprojects');
            }
        }
    }, [navigate]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setErrorMessage('');

        if (!formData.username || !formData.password) {
            setErrorMessage('Some login credentials are missing');
            return;
        }

        try {
            const res = await login(formData.username, formData.password);
            localStorage.setItem('token', res.token);

            const user = getUserFromToken(res.token);
            if (user?.isAdmin) {
                navigate('/');
            } else {
                navigate('/userprojects');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Login failed');
        }
    };

    return (
        <div className={`${styles.base}`}>
            <div className={`${styles.loginbox}`}>
                <p>Log in</p>

                <form onSubmit={handleSubmit}>
                    <div className={`${styles.loginboxtextarea}`}>

                        <div className={`${styles.contactcontenttextcolumn}`}>
                            <label className={`${styles.inputlabel}`}>User Name</label>
                            <input
                                className={`${styles.contactcontentthininput} ${submitted && !formData.username ? styles.contactcontentthininputError : ''}`}
                                type="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder='User Name'
                            />
                        </div>

                        <div className={`${styles.contactcontenttextcolumn}`}>
                            <label className={`${styles.inputlabel}`}>Password</label>
                            <input
                                className={`${styles.contactcontentthininput} ${submitted && !formData.password ? styles.contactcontentthininputError : ''}`}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder='Password'
                            />
                        </div>
                        <div className={`${styles.checkboxdiv}`}>
                            <label className={`${styles.checkboxlabel}`}>Show Password</label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)} />
                        </div>
                        <button type="submit">SUBMIT</button>
                        <div className={`${styles.errorarea}`}>{errorMessage && errorMessage}</div>
                    </div>
                </form>

            </div>
        </div>
    )

}
