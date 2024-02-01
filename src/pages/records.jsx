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

    const handleCancel = async (id) => {
        if(!window.confirm("취소하시겠습니까?")){
            return
        }
        try {
            // 서버에 예약 취소 요청을 보냅니다.
            const response =
                await axios.post('http://localhost:3001/auth/deleteRes',
                    { id: id },
                    { withCredentials: true });

            if(response.data){
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
            }
        } catch (error) {
            //console.error(`Error: ${error}`);
        }
    }

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
                            <td>
                                {
                                    (() => {
                                        const dateObj = new Date(item.date + 'T00:00:00Z'); // item.date를 UTC 0시의 Date 객체로 변환
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0); // 시간, 분, 초, 밀리초를 0으로 설정

                                        if (dateObj.getTime() < today.getTime()) {
                                            if(item.cancel === 'cancel') {
                                                return '취소';
                                            }
                                            return ''; // item.date가 오늘 이전의 날짜인 경우 공백 출력
                                        } else if (item.cancel === 'cancel') {
                                            return '취소';
                                        } else {
                                            return <button onClick={() => handleCancel(item.id)}>취소하기</button>;
                                        }
                                    })()
                                }
                            </td>
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