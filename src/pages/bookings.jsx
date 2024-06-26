// AdminPanel.js

import React, { useState, useEffect } from 'react';
import './Bookings.css';
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
    const [downRoom, setDownRoom] = useState('');
    const [downDate, setDownDate] = useState('');
    const [offset, setOffset] = useState(0);
    const [limitNum, setLimitNum] = useState(0);


    useEffect(() => {
        let isMounted = true; // 컴포넌트 마운트 상태를 추적합니다.

        axios.get('http://localhost:3001/auth/isLogin'
            , { withCredentials: true }) // 서버의 로그인 상태 확인 엔드포인트
            .then(response => {
                if (isMounted) { // 컴포넌트가 마운트 상태인 경우에만 상태를 변경합니다.
                    if (response.data.isAuthenticated && response.data.role === "admin") {
                        setIsLoggedIn(true);
                    } else {
                        navigate('/'); // 로그인 페이지로 리디렉션
                    }
                }
            })
            .catch(error => {
                if (isMounted) {
                    navigate('/'); // 오류 발생 시 로그인 페이지로 리디렉션
                }
            });

        return () => {
            isMounted = false; // 컴포넌트가 언마운트될 때 isMounted를 false로 설정합니다.
        };
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
            setDownRoom(selectedRoom);
            setDownDate(selectedDate);
            const adminResList = await axios.post('http://localhost:3001/admin/getBookings', { // 여기에 실제 서버 URL을 입력하세요.
                    room: selectedRoom,
                    date: selectedDate
                },
                {withCredentials: true})
            setReservation(adminResList.data);
        }
        catch (error){
            //console.log(error)
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
            setSelectedDate("");
        }
        else{
            setSelectedDate(e.target.value);
        }
    }

    const handleClick = () => {
        getBookings();
    }

    const handleDownload = async () => {
        if(!window.confirm("예약 내역을 다운로드 합니다")){
            return;
        }

        try {
            // 서버에 파일 다운로드 요청을 보냅니다.
            const response = await axios({
                url: 'http://localhost:3001/admin/downloadBookings',
                method: 'POST',
                data: { room: downRoom, date: downDate },
                withCredentials: true,
                responseType: 'blob',
            });

            if(response.status === 404){
                alert("예약 내역이 없습니다.")
                return;
            }

            // 서버로부터 받은 파일을 다운로드 합니다.
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');

            const csv_name = '' + roomNames(downRoom) + downDate + '_reservations.xlsx';

            link.href = url;
            link.setAttribute('download', csv_name); // 다운로드 받을 파일의 이름입니다.
            document.body.appendChild(link);
            link.click();

        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert("예약 내역이 없습니다");
                return;
            }
            //console.error(`Error: ${error}`);  // 요청이 실패하면 콘솔에 에러 메시지를 출력합니다.
        }

    }

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
                getBookings();
            }
        } catch (error) {
            //console.error(`Error: ${error}`);
        }

    };

    function roomNames(roomValue){
        switch (roomValue){
            case 'seminar':
                return "세미나실";
            case 'meetRoom1':
                return "소회의실1";
            case 'meetRoom2':
                return "소회의실2";
        }
        return ""
    }


    return (
        <div className="container">
            <h1>관리자 페이지</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <button style={{ width: '150px', height: '30px' }} onClick={handleClick}>
                    검색
                </button>
            </div>
            <div>
                <button className="download-button" onClick={handleDownload}>
                    다운로드
                </button>
            </div>
            {reservations.length > 0 ? (
                <div className="tableMarginBooks">
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
                                            if(item.cancel === '취소') {
                                                return '취소';
                                            }
                                            return ''; // item.date가 오늘 이전의 날짜인 경우 공백 출력
                                        } else if (item.cancel === '취소') {
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
                </div>
            ) : (
                <p>예약 내역이 없습니다</p>
            )}
            <button className="download-button" onClick={ () => backPage() }>뒤로가기</button>
            <br/><br/><br/><br/><br/>
        </div>
    );
};

export default AdminPanel;