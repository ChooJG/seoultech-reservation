import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import './Reservation.css';
import axios from "axios";

function Reservation() {
  const { roomId } = useParams();

  const roomNames = {
    '1': '세미나실',
    '2': '소회의실1',
    '3': '소회의실2',
    // Add more mappings as needed
  };

  const roomName = roomNames[roomId];

  // Generate time slots from 9:00 to 17:30 in 30-minute intervals
  const times = generateTimeSlots();

  // Generate dates for the next 10 days
  const availableDates = generateDates();

  const [startTime, setStartTime] = useState(times[0]);
  const [endTime, setEndTime] = useState(times[1]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');


  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    setShowModal(false);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
    setShowModal(false);
  };

  const validateTimes = async () => {
    const date = new Date(selectedDate);
    const start = new Date(`2023-01-01T${startTime}`);
    const end = new Date(`2023-01-01T${endTime}`);
    if (start >= end) {
      setShowModal(true);
    } else {
      const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const startTime = formatTime(start);
      const endTime = formatTime(end);
      const resDate = formatDate(date)

      console.log(start)
      console.log(endTime)
      console.log(roomName);
      console.log(resDate);

      try {
        const response =
            await axios.post('http://localhost:3001/auth/selectTime',
            { startTime, endTime, roomName, resDate },
            { withCredentials: true });

        const isSuccess = response.data.success
        if (isSuccess){
          alert("예약되었습니다.")
        }
        else{
          alert("이미 존재하는 예약입니다.");
        }
      }
      catch (error){
        console.error('로그인 요청에서 에러가 발생했습니다', error);
        alert('오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
      }





    }
  };

  return (
      <div className="reservation-form">
        <h3>{roomName}</h3>

        <label htmlFor="reservationDate" className="label">예약 날짜</label>
        <select id="reservationDate" value={selectedDate} onChange={handleDateChange}>
          {availableDates.map((date) => (
              <option key={date} value={date}>{date}</option>
          ))}
        </select>

      <label htmlFor="startTime" className="label">예약 시작 시간</label>
      <select id="startTime" value={startTime} onChange={handleStartTimeChange}>
        {times.map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>

      <label htmlFor="endTime" className="label">예약 종료 시간</label>
      <select id="endTime" value={endTime} onChange={handleEndTimeChange}>
        {times.map((time, index) => (
          <option key={time} value={time} disabled={index <= times.indexOf(startTime)}>{time}</option>
        ))}
      </select>

      <button className="reservation-button" onClick={validateTimes}><b>예약하기</b></button>

      {showModal && (
        <Modal>
          <p>시작 시간은 종료 시간보다 이전이어야 합니다.</p>
          <button onClick={() => setShowModal(false)}>확인</button>
        </Modal>
      )}
    </div>
  );
}

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

function generateDates() {
  const dates = [];
  for (let i = 0; i <= 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
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
