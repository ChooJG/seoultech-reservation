import React from 'react';
import './MyPage.css'; // 스타일시트 파일


function MyPage() {
    // 예약 데이터
    const reservations = [
        { id: 1, date: '2023. 11. 16 (화)', room: '세미나실', time: '14:00 - 15:30 (1시간 30분)', confirmed: true },
        { id: 2, date: '2023. 11. 15 (월)', room: '소회의실1', time: '14:00 - 15:30 (1시간 30분)', confirmed: false },
        { id: 3, date: '2023. 11. 15 (월)', room: '세미나실', time: '14:00 - 15:30 (1시간 30분)', confirmed: true },
        { id: 4, date: '2024. 11. 15 (월)', room: '세미나실', time: '14:00 - 15:30 (1시간 30분)', confirmed: true },
        { id: 5, date: '2024. 11. 19 (월)', room: '세미나실', time: '14:00 - 15:30 (1시간 30분)', confirmed: true },
        // ... 추가 예약 데이터
    ];

    reservations.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time.split(' - ')[0]}`);
        const dateB = new Date(`${b.date} ${b.time.split(' - ')[0]}`);
        return dateB - dateA;
    });

    // 날짜별로 그룹화된 예약 데이터를 생성
    const reservationsByDate = reservations.reduce((acc, reservation) => {
        if (!acc[reservation.date]) {
            acc[reservation.date] = [];
        }
        acc[reservation.date].push(reservation);
        return acc;
    }, {});

    const isReservationPast = (date, time) => {
        // 현재 날짜와 시간
        const now = new Date();
        // 예약 시간 파싱 (여기서는 간단한 예제로 작성합니다)
        const reservationDateTime = new Date(`${date} ${time.split(' - ')[1]}`);
        // 현재 시각이 예약 시각을 지났는지 여부 반환
        return now >= reservationDateTime;
    };


    return (
        <div className="mypage-container">
        <h2>나의 예약현황</h2>
        {Object.keys(reservationsByDate).map(date => (
          <div key={date} className="reservation-date-group">
            <div className="reservation-date">{date}</div>
            {reservationsByDate[date].map(reservation => (
              <div key={reservation.id} className={`reservation-card ${isReservationPast(reservation.date, reservation.time) ? "past" : "upcoming"}`}>
                <div className="reservation-room">{reservation.room}</div>
                <div className="reservation-time">{reservation.time}</div>
                <div className="reservation-action-container"> {/* This container will position the elements inside */}
                  {!isReservationPast(reservation.date, reservation.time) && (
                    <button className="reservation-cancel-button"><b>예약취소</b></button>
                  )}
                  {isReservationPast(reservation.date, reservation.time) && (
                    <img src="/ok_sign.png" alt="Confirmed" className="reservation-confirmation" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
}

export default MyPage;
