import React from 'react';

import {Outlet} from 'react-router-dom';
import './Favorites.css';
import { Link } from 'react-router-dom';


function Favorites() {

   
    return (
    <div>
    <header>
    </header>

    <main>
 
    <div>

    <Link to="/home" className="login-button">Home</Link>

    </div>
    </main>
    
    </div>

    )

}


export default Favorites;