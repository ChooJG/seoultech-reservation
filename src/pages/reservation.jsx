import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import './Reservation.css';

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

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    setShowModal(false);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
    setShowModal(false);
  };

  const validateTimes = () => {
    const start = new Date(`2023-01-01T${startTime}`);
    const end = new Date(`2023-01-01T${endTime}`);
    if (start >= end) {
      setShowModal(true);
    } else {
      // Submit the form or do the next steps
    }
  };

  return (
    <div className="reservation-form">
      <h3>{roomName}</h3>

      <label htmlFor="reservationDate" className="label">예약 날짜</label>
      <select id="reservationDate">
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

export default Reservation;
