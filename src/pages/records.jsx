// AdminPanel.js

import React, { useState, useEffect } from 'react';
import './Records.css';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AdminPanel = () => {

    const [reservations, setReservation] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        axios.get('http://localhost:3001/auth/isLogin'
            , { withCredentials: true }) // 서버의 로그인 상태 확인 엔드포인트
            .then(response => {
                if (response.data.isAuthenticated && response.data.role === "admin") {
                    setIsLoggedIn(true);
                } else {
                    navigate('/'); // 로그인 페이지로 리디렉션
                }
            })
            .catch(error => {
                //console.error('로그인 상태 확인 중 오류 발생:', error);
                navigate('/'); // 오류 발생 시 로그인 페이지로 리디렉션
            });
    }, [navigate]);

    useEffect(() => {
        let userinfo;
        if (location.state !== null) {
            userinfo = location.state.user;
            axios.post('http://localhost:3001/admin/infoWatch',
                { id: userinfo.id },
                { withCredentials: true })
                .then(response => {
                    setReservation(response.data);
                })
                .catch(error => {
                    //console.error('Error fetching users:', error);
                });
        }
    }, []);


    if (!isLoggedIn) {
        return <div>now loading...</div>; // 로그인 확인 중 표시
    }

    const handleAddUser = () => {
        navigate('/admin');
    };

    return (
        <div className="container">
            <h1>관리자 페이지</h1>
            {reservations.length > 0 ? (
                <table>
                    <thead>
                    <tr>
                        <th>회사명</th>
                        <th>회의실</th>
                        <th>날짜</th>
                        <th>시작시간</th>
                        <th>종료시간</th>
                        <th>취소여부</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reservations.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.room}</td>
                            <td>{item.date}</td>
                            <td>{item.start}</td>
                            <td>{item.end}</td>
                            <td>{item.cancel === 'cancel' ? '취소' : item.cancel}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>예약 내역이 없습니다</p>
            )}
            <button className="download-button" onClick={ () => handleAddUser() }>뒤로가기</button>
        </div>
    );
};

export default AdminPanel;