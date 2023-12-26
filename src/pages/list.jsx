// List.js
import React from 'react';
import { Link } from 'react-router-dom';
import './List.css';

function List() {
    // Your meetingRooms array
    const meetingRooms = [
        { id: 1, name: '세미나실', image: '/seminar1.jpg' },
        { id: 2, name: '소회의실1', image: '/seminar2.jpg' },
        { id: 3, name: '소회의실2', image: '/seminar3.jpg' },
        // ... additional meeting rooms ...
    ];

    return (
        <div className="list-container">
            <h3 style={{ textAlign: "center" }}>예약 장소 선택</h3>
            <div className="meeting-rooms">
                {meetingRooms.map(room => (
                    <Link to={`/reservation/${room.id}`} key={room.id} className="meeting-room">
                        <img src={room.image} alt={room.name} className="room-image" />
                        <div className="room-name">{room.name}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default List;
