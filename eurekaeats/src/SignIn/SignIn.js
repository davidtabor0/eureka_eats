import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useJToken from '../utils/useJToken'; // For ESLint of LogIn doc comment.

import '../index.css';
import './SignIn.css';
import logo1 from '../assets/EurekaEatsLogo.png';
import longlogo from '../assets/EurekaEatsLongLogo.png'

/**
 * @description Stateful page component for initial sign-in. Checks the user session token with a to-backend call before further routing.
 * @param {{usedJTokenHook: useJToken}} param0 
 */
function SignIn({usedJTokenHook}) {
  /* State of login component: stores user inputs. */
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [password, setPassword] = useState();
  const { setToken, token } = usedJTokenHook();

  if (token !== 'guest') {
    return <Navigate to="/login" />;
  }

  /**
   * @description Helper function for making an AJAX call to the app's API in order to process the login.
   * @param {{firstName: string, lastName: string, username: string, email: string, firstName: string, lastName: string, password: string}} credentials
   * @returns {Promise<{payload: number, data: {token: string} | null} | null>}
   */
  const doSignInCall = async (credentials) => {
    return fetch('http://127.0.0.1:5000/api/users/action', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 34, args: credentials })
    })
      .then((response) => {
        return response.json();
      }).catch((error) => {
        console.error(`eurekaeats [API Error]: ${error}`);
        return null;
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // All fields are required.
    if (!username || !email || !firstName || !lastName || !password) {
      return false;
    }

    const responseData = await doSignInCall({
      firstName,
      lastName,
      username,
      email,
      password
    });

    // If we get null data or a false boolean back, the call failed :(
    if (!responseData) {
      setToken(null);
      console.error('[eurekaeats]: No valid JSON response!');
    } else if (responseData.payload === 3) {
      // Here, the payload is a success boolean that is basically false.
      setToken(null);
      console.log(`[eurekaeats]: ${JSON.stringify(responseData)}`);
    } else if (responseData.payload === 2) {
      // At this point, the only other allowed payload code is an object. By the required JSON format, access object.data.token!
      setToken(responseData.data.token);
      console.log(`[eurekaeats]: set token from ${JSON.stringify(responseData)}`);
    } else {
      setToken(null);
      console.log(`[eurekaeats]: set guest token from ${JSON.stringify(responseData)}`);
    }

    return true;
  };

  return (
    <>
           <header className='login-page-header'>
        <div className="login-page-logo">
        <Link to="/">
          <img src={longlogo} alt="EurekaEats Logo" />
          </Link>
        </div>
      </header>
      <div>
        <h2 className='signin-page-h2'>Sign Up for EurekaEats</h2>
        <main className="signin-page-main-content">
          <div className='signin-page-content-box'>
         
            <Link to="/login">
              <p>Already have an account? Log in here!</p>
            </Link>
            <form onSubmit={handleSubmit}>
              <div className="signin-page-form-field-bar">
                <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="signin-page-form-field-bar">
                <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="signin-page-form-field-bar">
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="signin-page-form-field-bar">
                <input type="text" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="signin-page-form-field-bar">
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <input type="submit" className="signin-page-form-login-button" value={'Register'} />
            </form>
            <div className="signin-page-go-back-text">
              <Link to="/">
                <p>Made a wrong turn? Head back to the home page</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Outlet />
    </>
  );
}

export default SignIn;
