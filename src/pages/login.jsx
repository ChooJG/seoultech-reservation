import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function Login(){
    const [userid, setId] = useState('');
    const [password, setPw] = useState('');
    const navigate = useNavigate();


    const onChangeHandleId = (event) => {
        setId(event.target.value);
    };
    
    const onChangeHandlePw = (event) => {
        setPw(event.target.value);
    };

    const onLogin = async (event) => {
        event.preventDefault();
        try {
            const response =
                await axios.post('http://localhost:3001/auth/login',
                    { userid, password },
                    { withCredentials: true });
            console.log("클라이언트 onlogin")
            const isSuccess = response.data.success

            if (isSuccess) {
                console.log(isSuccess);
                navigate('/list');
            } else {
                console.error(response.data.message);
                alert('아이디 또는 비밀번호가 잘못되었습니다.')
            }
        } catch (error) {
            console.error('로그인 요청에서 에러가 발생했습니다', error);
            alert('오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.');
        }
    };

    console.log(userid, password);

    return(
        <div className="container">
            <div className="logo-container">
                <img src="/logo.png" alt="Seoultech Logo" />
            </div>
            <h3 className="center-text" style={{color:"#6D6D6D"}}>창업보육센터</h3>
            <p className="center-text" style={{ marginBottom: '40px', color:"#BFBFBF"}}><b>Value-up room 사용 예약 시스템</b></p>
            <div className="input-container">
                <label htmlFor="id" className="label">아이디</label>
                <input
                    id="id"
                    type="text"
                    placeholder="아이디를 입력해주세요"
                    value={userid}
                    onChange={onChangeHandleId}
                    className="input-field"
                />
            </div>
            <div className="input-container">
                <label htmlFor="pw" className="label">비밀번호</label>
                <input
                    id="pw"
                    type="password"
                    placeholder="비밀번호를 입력해주세요"
                    value={password}
                    onChange={onChangeHandlePw}
                    className="input-field"
                />
            </div>
            <button
                onClick={onLogin}
                className="login-button"
            >
                로그인
            </button>
        </div>
    );
}

export default Login;
