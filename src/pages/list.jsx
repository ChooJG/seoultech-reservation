import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './List.css';
//import { useAuth } from '../AuthContext';
import axios from "axios";

function List() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [leastTime, setLeastTime] = useState(0);
    const [isAdmin, setIsAdmin] = useState("false");

    useEffect(() => {
        const source = axios.CancelToken.source();
        axios.get('http://localhost:3001/auth/isLogin'
            , {
                withCredentials: true,
                cancelToken: source.token
            }) // 서버의 로그인 상태 확인 엔드포인트
            .then(response => {
                if (response.data.isAuthenticated) {
                    setIsLoggedIn(true);
                    if (response.data.role === 'admin'){
                        setIsAdmin("admin");
                    }
                } else {
                    navigate('/'); // 로그인 페이지로 리디렉션
                }
            })
            .catch(error => {
                //console.error('로그인 상태 확인 중 오류 발생:', error);
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                }
                else{
                    navigate('/'); // 오류 발생 시 로그인 페이지로 리디렉션
                }
            });
        return () => {
            source.cancel('Operation canceled by the user.');
        };
    }, [navigate]);

    useEffect(() => {
        const source = axios.CancelToken.source();
        axios.get('http://localhost:3001/auth/ckLeastTime'
            , { withCredentials: true, cancelToken: source.token }) // 서버의 로그인 상태 확인 엔드포인트
            .then(response => {
                if (isAdmin === "admin"){
                    setLeastTime("00");
                }
                else{
                    setLeastTime(response.data.value);
                }
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                }
                //console.error(error);
            });
        return () => {
            source.cancel('Operation canceled by the user.');
        };
    }, [isAdmin]);

    if (!isLoggedIn) {
        return <div>now loading...</div>; // 로그인 확인 중 표시
    }


    // 회의실 목록 배열
    const meetingRooms = [
        { id: 1, name: '세미나실', image: '/seminar1.jpg' },
        { id: 2, name: '소회의실1', image: '/seminar2.jpg' },
        { id: 3, name: '소회의실2', image: '/seminar3.jpg' },
        { id: 4, name: '전체회의실', image: '/whole.png' },
        // ... 추가 회의실 ...
    ];

    return (
        <div className="list-container">
            <h3 style={{ textAlign: "center" }}>
                창업지원단
            </h3>
            <h3 style={{ textAlign: "center" }}>
                Value-up room 예약 장소 선택 (잔여시간 : <span style={{ color: 'red' }}>{leastTime}</span>시간)
            </h3>
            <div className="meeting-rooms">
                {meetingRooms.map(room => {
                    if(room.name === '전체회의실') {
                        return (
                            <Link to={`/reservation/${room.id}`} key={room.id} className="meeting-room">
                                <img src={room.image} alt={room.name} className="room-image" />
                                <div className="room-name" style={{whiteSpace: "pre-line"}}>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    Value-up room 단독사용<br/>
                                    (세미나실 + 소회의실1 + 소회의실2)
                                </div>
                            </Link>
                        )
                    } else {
                        // room.id가 4가 아닌 경우의 기존 코드
                        return (
                            <Link to={`/reservation/${room.id}`} key={room.id} className="meeting-room">
                                <img src={room.image} alt={room.name} className="room-image" />
                                <div className="room-name" style={{whiteSpace: "pre-line"}}>{room.name}</div>
                            </Link>
                        )
                    }
                })}
            </div>
            <div className="notice">
                <h3>🌟회의실 사용 안내🌟</h3>
                <ul>
                    <li>1. 회의실 사용 후 냉난방기 전원 꼭 꺼주세요.</li>
                    <li>2. 소등 및 출입문 시건 철저히 해주세요.</li>
                    <li>3. 정리 정돈 깨끗이 해주세요.</li>
                    <li>4. 기타 문의사항 등은 평일 업무 시간 내 (9:00 ~ 18:00)
                        <br/>📞02-970-9026으로 연락 바랍니다.</li>
                </ul>
                <p>※ 예약은 10일간 최대 30시간까지 가능합니다. <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;(특별한 사정으로 추가 예약이 필요할 경우, 매니저에게 연락 주세요.)</p>
            </div>
        </div>
    );
}

export default List;
