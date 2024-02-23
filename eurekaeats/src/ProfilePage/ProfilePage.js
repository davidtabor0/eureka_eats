import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

import useJToken from '../utils/useJToken';

import '../index.css';
import './ProfilePage.css';
import longlogo from '../assets/EurekaEatsLongLogo.png'


/**
 * @description Simple greeting component for a logged in user.
 * @param {{firstName: string, lastName: string}} param0 
 */
function UserBanner({firstName, lastName}) {
    return (
        <>
        <div className = 'profile-info-content'>

            <h1 className='profile-page-h2-bottom'>Welcome, {firstName}!</h1>
            
            <h2 className='profile-page-h2'>Edit Your Info Here</h2>
            <h2 className='profile-page-h2-bottom'> Also Known As: {firstName} {lastName}</h2>

            </div>
            <br/>
        </>
    );
}

/**
 * @description Stateful page component for user profile page UI. 
 * @param {{usedJTokenHook: useJToken}} param0 
 */
function ProfilePage({usedJTokenHook}) {
    /* State */
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName]= useState('');
    const [userName, setUserName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const {token, setToken} = usedJTokenHook();
    const [loadOk, setLoadOk] = useState(false); // if user data for session is already loaded... stops extra AJAX calls.

    /* Event Handlers */

    /**
     * @description Makes an application API call to logout the user. Specifically, the tracked session UUID of the user will be cleared.
     * @note See the SDD section 5.6 for logout call info.
     * @param {{username: string, password: string}} credentials 
     * @returns {Promise<{payload: number, data: *} | null>}
     */
    const doLogoutCall = async (credentials) => {
        return fetch('http://127.0.0.1:5000/api/users/action', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: 37, args: credentials})
        })
        .then((response) => {
            console.log(`eurekaeats [API Debug]: call status ${response.status}`); // Only parse JSON if request got HTTP OK for good semantics.
            return (response.status === 200) ? response.json() : null;
        })
        .catch((error) => {
            console.error(`eurekaeats [API Error]: ${error}`);
            return null;
        });
    };

    /**
     * @description Event handler for logout form.
     * @param {{username: string, password: string}} event 
     */
    const handleLogoutSubmit = async (event) => {
        event.preventDefault();

        const response = await doLogoutCall({
            username: userName,
            password: confirmPassword
        });

        if (!response) {
            console.error(`eurekaeats [API Debug]: Call failed with success=false.`);
        } else if (response.payload === 3) {
            setToken(null);
            console.log(`eurekaeats [API Debug]: Call succeeded with success=true.`);
        } else {
            console.error(`eurekaeats [API Debug]: Call served with invalid payload code ${response.payload}`);
        }
    };

    /**
     * @description Loads some basic user info (real name) for this private profile page. See SDD 5.6 for app API call notes.
     * @param {{token: string}} credentials 
     * @returns {Promise<{payload: number, data: *} | null>}
     */
    const loadUserInfo = async (credentials) => {
        return fetch('http://127.0.0.1:5000/api/users/action', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: 32, args: credentials})
        })
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.error(`eurekaeats [API Error]: ${error}`);
            return null;
        });
    };

    // Use useEffect to update user info besides stateless render.
    useEffect(() => {
        const doStatefulDataLoad = async () => {
            if (loadOk) {
                return;
            }

            const replyData = await loadUserInfo({token: token});

            if (!replyData) {
                console.error(`eurekaeats [API Error]: Fetch failed.`);
            } else if (replyData.payload === 4) {
                console.error(`eurekaeats [API Error]: No valid data found.`);
            } else if (replyData.payload === 2 && replyData.data !== null) {
                console.log(`eurekaeats [API Debug]: ${replyData}`);
                setUserName(replyData.data.username);
                setFirstName(replyData.data.first_name);
                setLastName(replyData.data.last_name);
                setLoadOk(true);
            } else {
                setToken(null);
                console.error(`eurekaeats [API Error]: Invalid payload.`);
            }
        };
        
        doStatefulDataLoad();
    }, [token, setToken, loadOk, setLoadOk]);

    // Check for unauthenticated guests: redirect them to login!
    if (token === 'guest') {
        return (<Navigate to='/login'/>);
    }

    return (
        <>
            <header className='profile-page-header'>
        <div className="profile-logo">
          <img src={longlogo} alt="EurekaEats Logo" />
        </div>
        <div className="profile-header-buttons">
          <Link to="/home" className="profile-signup-button">Home</Link>
         </div>
            </header>
            
            <main className='profile-page-main'>
                <section className='profile-section'>
                    <UserBanner firstName={firstName} lastName={lastName}/>
                    {/* Logout Confirmation Form (required by app API) */}
                    <form className='profile-page-logout-form' onSubmit={(event) => handleLogoutSubmit(event)}>
                        <div className='profile-page-logout-form-section'>
                            <label htmlFor='username-field' className='profile-page-logout-form-label'>Username:</label>
                        </div>
                        <div className='profile-page-logout-form-section'>
                            <input id='username-field' className='profile-page-logout-form-input' type='text' placeholder='edit username' onChange={(event) => {setUserName(event.target.value)}}/>
                        </div>
                        <div className='profile-page-logout-form-section'>
                            <label htmlFor='password-field' className='profile-page-logout-form-label'>Password:</label>
                        </div>
                        <div className='profile-page-logout-form-section'>
                            <input id='password-field' className='profile-page-logout-form-input' type='password' placeholder='edit password' onChange={(event) => {setConfirmPassword(event.target.value)}}/>
                        </div>
                        <div className='profile-page-logout-form-section'>
                            <input className='profile-page-logout-form-button' type='submit' value={'Logout'}/>
                        </div>
                    </form>
                </section>
            </main>
            <Outlet/>
        </>
    )
}

export default ProfilePage;
