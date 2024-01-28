// AdminPanel.js

import React, { useState, useEffect } from 'react';
import './Admin.css';
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AdminPanel = () => {

    const [reservations, setReservation] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [dates, setDates] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedDate, setSelectedDate] = useState('');


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
        const fetchData = async () => {
            const dateArray = [];
            const today = new Date();
            dateArray.push("::전체::");
            for(let i = 0; i <= 10; i++){
                let date = new Date();
                date.setDate(today.getDate() + i);
                let dateString = date.toISOString().substring(0,10);
                dateArray.push(dateString);
            }
            setDates(dateArray);
            setSelectedDate("");
            setSelectedRoom("");
            await getBookings();
        };
        fetchData();
    }, []);

    const getBookings = async () => {
        try {

            const adminResList = await axios.post('http://localhost:3001/admin/getBookings', { // 여기에 실제 서버 URL을 입력하세요.
                    room: selectedRoom,
                    date: selectedDate
                },
                {withCredentials: true})
            setReservation(adminResList.data);
        }
        catch (error){
            console.log(error)
        }
    }

    if (!isLoggedIn) {
        return <div>now loading...</div>; // 로그인 확인 중 표시
    }

    const backPage = () => {
        navigate('/admin');
    }

    const handleRoomChange = (e) => {
        setSelectedRoom(e.target.value);
    }

    const handleDateChange = (e) => {
        if(e.target.value === "::전체::"){
            setSelectedRoom("");
        }
        else{
            setSelectedDate(e.target.value);
        }
    }

    const handleClick = () => {
        getBookings();
    }


    return (
        <div className="container">
            <h1>관리자 페이지</h1>
            <div>
                <select name="room" onChange={handleRoomChange}>
                    <option value="">::전체::</option>
                    <option value="seminar">세미나실</option>
                    <option value="meetRoom1">소회의실1</option>
                    <option value="meetRoom2">소회의실2</option>
                </select>
                <select name="date" onChange={handleDateChange}>
                    {dates.map((date, index) => (
                        <option key={index} value={date}>
                            {date}
                        </option>
                    ))}
                </select>
                <button onClick={handleClick}>
                    검색
                </button>
            </div>
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
            <button className="download-button" onClick={ () => backPage() }>뒤로가기</button>
        </div>
    );
};

export default AdminPanel;