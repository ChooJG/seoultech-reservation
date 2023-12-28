import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './List.css';
//import { useAuth } from '../AuthContext';
import axios from "axios";

function List() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/auth/isLogin'
            , { withCredentials: true }) // 서버의 로그인 상태 확인 엔드포인트
            .then(response => {
                if (response.data.isAuthenticated) {
                    setIsLoggedIn(true);
                } else {
                    navigate('/login'); // 로그인 페이지로 리디렉션
                }
            })
            .catch(error => {
                console.error('로그인 상태 확인 중 오류 발생:', error);
                navigate('/login'); // 오류 발생 시 로그인 페이지로 리디렉션
            });
    }, [navigate]);

    if (!isLoggedIn) {
        return <div>now loading...</div>; // 로그인 확인 중 표시
    }


    // 회의실 목록 배열
    const meetingRooms = [
        { id: 1, name: '세미나실', image: '/seminar1.jpg' },
        { id: 2, name: '소회의실1', image: '/seminar2.jpg' },
        { id: 3, name: '소회의실2', image: '/seminar3.jpg' },
        // ... 추가 회의실 ...
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
