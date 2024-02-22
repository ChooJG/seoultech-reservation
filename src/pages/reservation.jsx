import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Reservation.css';
import './TimeSlots.css';
import axios from "axios";
const moment = require('moment-timezone');

function Reservation() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Generate time slots from 9:00 to 17:30 in 30-minute intervals
  const times = generateTimeSlots();

  // Generate dates for the next 10 days
  const availableDates = generateDates(isAdmin);

  const [startTime, setStartTime] = useState(times[0]);
  const [endTime, setEndTime] = useState(times[1]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');

  const { roomId } = useParams();
  const [reservedSlots, setReservedSlots] = useState(['']);

  useEffect(() => {
      const source = axios.CancelToken.source();
      axios.get(`http://localhost:3001/auth/isLogin`,
        { withCredentials: true, cancelToken: source.token })
        .then(response => {
          if (response.data.isAuthenticated) {
            setIsLoggedIn(true);
            if(response.data.role === 'admin'){
                setIsAdmin(true);
            }
          } else {
            navigate(`/`);
          }
        })
        .catch(error => {
            //console.error('로그인 상태 확인 중 오류 발생:', error);
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                navigate(`/`);
            }
        });
      return () => {
          source.cancel('Operation canceled by the user.');
      };
  }, [navigate, roomId]); // id가 변경될 때마다 로그인 상태를 재확인합니다

  //페이지 온로드 되는 순간 오늘 예약된 목록 보이기
  useEffect(() => {
      const source = axios.CancelToken.source();
      const today = new Date();
      today.setHours(today.getHours() + 9); // UTC를 KST로 변환
      const formattedToday = today.toISOString().split('T')[0];

      // 서버에 오늘 날짜를 보냅니다.
    axios.post('http://localhost:3001/auth/resDate',
        {
          date: formattedToday,
          roomName: roomName
        },
        { withCredentials: true, cancelToken: source.token })
        .then(response => {
          const initialReservedTimes = response.data;
          setReservedSlots(initialReservedTimes);
        })
        .catch(error => {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                //console.error('Error while sending date to server:', error);
            }
        });
      return () => {
          source.cancel('Operation canceled by the user.');
      };
  }, []);


  const roomNames = {
    '1': '세미나실',
    '2': '소회의실1',
    '3': '소회의실2',
    '4': '전체회의실',
    // 필요에 따라 더 많은 매핑을 추가하세요
  };


  const roomName = roomNames[roomId];

  //이미 예약된 데이터 넣기
  const handleDateChange = (e) => {

    setSelectedDate(e.target.value);
    const nowResDate = e.target.value;
      //console.log(e.target.value)

    axios.post('http://localhost:3001/auth/resDate',
        {
          date: nowResDate,
          roomName: roomName
        },
        { withCredentials: true })
        .then(response => {
          const reservedTimes = response.data;
          setReservedSlots(reservedTimes);
        })
        .catch(error => {
            //console.error('Error while sending date to server:', error);
        });
  };

    const numberListItems = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((number, index) => {
        const gridColumnStart = 1 + index * 2;
        return <p key={number} style={{ gridColumnStart }}>{number}</p>;
    });

    const renderReservationTime = () => {
        // '2023-12-25' 형식의 날짜를 '23.12.25' 형식으로 변환
        const formattedDate = selectedDate.replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2})$/, '$2.$3.$4');

        return (
            <div className="reservation-time">
                <h4>{formattedDate} {roomName} {startTime} ~ {endTime}</h4>
            </div>
        );
    };

  const confirmReservation = async () => {
    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const startTimeFormat = formatTime(start);
    const endTimeFormat = formatTime(end);

    // 시작 시간이 종료 시간보다 같거나 늦으면 경고를 띄웁니다.
    if (startTimeFormat >= endTimeFormat || startTimeFormat === "18:00") {
      alert("시작 시간은 종료 시간보다 이전이어야 합니다."); // 에러 메시지를 alert으로 표시합니다.
    } else {
      // 예약 시간이 유효한 경우, 예약 완료 처리를 하고 /mypage로 이동합니다.
      const date = new Date(selectedDate);
      const resDate = formatDate(date)

      try {
        const response =
            await axios.post('http://localhost:3001/auth/selectTime',
                {
                  startTime: startTimeFormat,
                  endTime: endTimeFormat,
                  resDate,
                  roomName,
                },
                { withCredentials: true });
        if (response.data.success){
            alert("예약되었습니다.");
            navigate('/mypage');
        }
        else{
            if(response.status === 400){
                alert("예약 가능시간을 초과하였습니다.")
            }
            else if(response.status === 409){
                alert("이미 존재하는 예약입니다.")
            }
        }


      }
      catch (error){
          //console.error('예약 에러', error);
          if(error.response.status === 400){
              alert("예약 가능시간을 초과하였습니다.");
          }
          else if(error.response.status === 409){
              alert("이미 존재하는 예약입니다.");
          }
          else{
              alert('오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
          }
      }

    }
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    // 시작 시간을 변경하면 종료 시간도 업데이트
    updateEndTimeOptions(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const updateEndTimeOptions = (newStartTime) => {
    // 새로운 시작 시간 이후의 예약 가능한 시간들을 계산
    const timeIndex = times.indexOf(newStartTime);
    const newEndTimeOptions = times.slice(timeIndex + 1).filter(time => {
      return !reservedSlots.includes(time);
    });

    // 새로운 종료 시간 옵션들 중 첫 번째 시간을 기본값으로 설정
    if (newEndTimeOptions.length > 0) {
      setEndTime(newEndTimeOptions[0]);
    } else {
      // 가능한 종료 시간이 없다면, 기본값을 비활성화 상태로 설정
      setEndTime("");
    }
  };

  const renderStartTimeOptions = (reserved) => {
    return times.map((time, index) => {
      // 예약된 시간대가 정확히 일치하는 경우에만 선택 불가능하게 만듭니다.
      const isDisabled = reserved.includes(time);
      return (
          <option key={time} value={time} disabled={isDisabled}>
            {time}
          </option>
      );
    });
  };

  const renderEndTimeOptions = (start, reserved) => {
    const startIndex = times.indexOf(start);
    let endIndex = times.length; // 종료 시간 옵션의 마지막 인덱스 초기값 설정

    // 선택된 시작 시간 이후의 예약된 시간대를 찾아서 그 이전 시간까지만 종료 시간으로 설정합니다.
    for (let i = startIndex + 1; i < times.length; i++) {
      if (reserved.includes(times[i])) {
        endIndex = i - 1; // 연속된 예약의 시작 바로 전 시간을 마지막 인덱스로 설정
        break;
      }
    }

    return times.map((time, index) => {
      // 선택된 시작 시간 이후부터 연속된 예약 시작 시간 바로 전까지만 활성화합니다.
      const isDisabled = index <= startIndex || index > endIndex + 1;
      return (
          <option key={time} value={time} disabled={isDisabled}>
            {time}
          </option>
      );
    });
  };

  return (

      <div className="reservation-container">
        <h3>{roomName}</h3>
        <label className="label">예약 현황</label>
          <div className="number-list">
              {numberListItems}
          </div>

        <TimeSlots times={times} reservedSlots={reservedSlots} startTime={startTime} endTime={endTime} />
        <label htmlFor="reservationDate" className="label">예약 날짜</label>
        <select id="reservationDate" value={selectedDate} onChange={handleDateChange}>
          {availableDates.map((date) => (
              <option key={date} value={date}>{date}</option>
          ))}
        </select>

        <label htmlFor="startTime" className="label">예약 시작 시간</label>
        <select id="startTime" value={startTime} onChange={handleStartTimeChange}>
          {renderStartTimeOptions(reservedSlots)}
        </select>

        <label htmlFor="endTime" className="label">예약 종료 시간</label>
        <select id="endTime" value={endTime} onChange={handleEndTimeChange}>
          {renderEndTimeOptions(startTime, reservedSlots)}
        </select>

        <br />
        {renderReservationTime()}
        <button className="reservation-button" onClick={confirmReservation}>예약하기</button>
          <br/><br/><br/><br/><br/>
      </div>
  );

}

function TimeSlots({ times, reservedSlots, startTime, endTime }) {
  // 선택된 시간 범위를 구하기 위한 함수
  const isSelected = (time) => {
    const start = times.indexOf(startTime);
    const end = times.indexOf(endTime);
    const currentIndex = times.indexOf(time);
    return currentIndex >= start && currentIndex < end;
  };

  const isReserved = time => reservedSlots.includes(time);

  return (
      <div className="time-slots-container">
        {times.slice(0, -1).map((time) => (
            // 첫 번째 박스와 30분 간격으로 레이블을 추가합니다.
            <div
                key={time}
                className={`time-slot ${isReserved(time) ? 'reserved' : ''} ${
                    isSelected(time) ? 'selected' : ''
                }`}
            ></div>
        ))}
      </div>
  );
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) { // 18시는 포함하지 않음
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  slots.push('18:00'); // 마지막으로 18:00만 추가
  return slots;
}

function generateDates(isAdmin) {
    const dates = [];
    const daysToAdd = isAdmin ? 365 : 10;
    for (let i = 0; i < daysToAdd; i++) {
        const date = moment().tz('Asia/Seoul').add(i, 'days');
        dates.push(date.format('YYYY-MM-DD'));
    }
    return dates;
}

function formatDate(dateObject) {
  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
  const day = dateObject.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default Reservation;
