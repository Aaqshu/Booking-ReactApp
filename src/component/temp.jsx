import React from 'react';
import userNotFound  from '../assets/usernotfound.png'

export default function UserNotFound () {
    return(
        <div className="nt-container">
            <div className="nt-found-container">
                <img className="img-sign" src={userNotFound} width="100" height="50" />
                <label className="nt-found-h1">User Not Found</label>
                <label className="nt-found-h2">Create Your Own Appointment Booking Service In 3 Easy Steps.</label>
                <label className="nt-tag">Free!</label>
                <a href="https://www.que.do/"><button className="nt-que-btn">Get Que</button></a>
            </div>
        </div>
    )
}