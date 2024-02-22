import React, { useState, useEffect } from 'react';
import './MyPage.css'; // 스타일시트 파일
import axios from "axios";
import {useNavigate} from "react-router-dom";
const moment = require('moment-timezone');


function MyPage() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);

    // 로그인 상태 확인
    useEffect(() => {
        let isMounted = true;
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:3001/auth/isLogin', { withCredentials: true });

                if (isMounted) {  // 컴포넌트가 마운트 상태인 경우에만 상태를 업데이트
                    if (response.data.isAuthenticated) {
                        setIsLoggedIn(true);
                    } else {
                        navigate('/');
                    }
                }
            } catch (error) {
                if (isMounted) {  // 컴포넌트가 마운트 상태인 경우에만 상태를 업데이트
                    navigate('/');
                }
            }
        };

        checkLoginStatus();

        return () => {
            isMounted = false;  // 컴포넌트가 언마운트되면 isMounted를 false로 설정
        };
    }, [navigate]);

    // 예약 데이터 가져오기 함수
    const fetchReservations = () => {
        axios.get('http://localhost:3001/auth/getUserRes', { withCredentials: true })
            .then(response => {
                if (response.data.length === 0) {
                    setReservations([]);
                    return;
                }

                const sortedReservations = response.data.sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time.split(' - ')[0]}`);
                    const dateB = new Date(`${b.date} ${b.time.split(' - ')[0]}`);
                    return dateA - dateB;
                });
                setReservations(sortedReservations);
            })
            .catch(error => {
                //console.error('There was an error!', error);
            });
    };


    // 로그인 상태에 따라 예약 데이터 가져오기
    useEffect(() => {
        if (isLoggedIn) {
            fetchReservations();
        }
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return <div>now loading...</div>; // 로그인 확인 중 표시
    }

    // reservations 배열이 비어있지 않은 경우에만 정렬을 수행
    if (reservations.length > 0) {
        reservations.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time.split(' - ')[0]}`);
            const dateB = new Date(`${b.date} ${b.time.split(' - ')[0]}`);
            return dateB - dateA;
        });
    }

    // 날짜별로 그룹화된 예약 데이터를 생성
    const reservationsByDate = reservations.reduce((acc, reservation) => {
        if (!acc[reservation.date]) {
            acc[reservation.date] = [];
        }
        acc[reservation.date].push(reservation);
        return acc;
    }, {});

    const isReservationPast = (date, time) => {
        const formattedDate = date.slice(0, 12).replace(/\. /g, '-');
        const parts = time.split(' (');
        const formattedtime = parts[0];


        const now = moment().tz('Asia/Seoul');  // 현재 시간 (KST)
        const reservationDateTime = moment.tz(`${formattedDate} ${formattedtime.split(' - ')[1]}`, 'Asia/Seoul');  // 예약 시간 (KST)
        return now >= reservationDateTime;
    };


    //예약 취소 버튼
    async function handleButtonClick (event, reservation) {
        //console.log(event.target);  // 클릭된 버튼의 정보
        //console.log(reservation.id);   // 예약 정보

        if(!window.confirm("예약을 취소하시겠습니까?")){
            return;
        }

        try {
            // 서버에 예약 취소 요청을 보냅니다.
            const response =
                await axios.post('http://localhost:3001/auth/deleteRes',
                { id: reservation.id },
                { withCredentials: true });

            //console.log(response.data);
            if(response.data){
                fetchReservations();
            }
        } catch (error) {
            //console.error(`Error: ${error}`);  // 요청이 실패하면 콘솔에 에러 메시지를 출력합니다.
        }

    }


    return (
        <div className="mypage-container">
            <h2>나의 예약현황</h2>
            {Object.keys(reservationsByDate).length === 0 ? (
                <div className="no-reservations">예약 정보가 없습니다.</div>
            ) : (
                Object.keys(reservationsByDate).map(date => (
                    <div key={date} className="reservation-date-group">
                        <div className="reservation-date">{date}</div>
                        {reservationsByDate[date].map(reservation => (
                            <div key={reservation.id} className={`reservation-card ${isReservationPast(reservation.date, reservation.time) ? "past" : "upcoming"}`}>
                                <div className="reservation-room">{reservation.room}</div>
                                <div className="reservation-time">{reservation.time}</div>
                                <div className="reservation-action-container">
                                    {!isReservationPast(reservation.date, reservation.time) && (
                                        <button
                                            className="reservation-cancel-button"
                                            onClick={(event) => handleButtonClick(event, reservation)}
                                        >
                                            <b>예약취소</b>
                                        </button>

                                    )}
                                    {isReservationPast(reservation.date, reservation.time) && (
                                        <img src="/ok_sign.png" alt="Confirmed" className="reservation-confirmation" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );

}

export default MyPage;
