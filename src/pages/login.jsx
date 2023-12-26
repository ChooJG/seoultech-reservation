import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login(){
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const navigate = useNavigate();

    const onChangeHandleId = (event) => {
        setId(event.target.value);
    };
    
    const onChangeHandlePw = (event) => {
        setPw(event.target.value);
    };

    const onLogin = async () => {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, pw }),
            });

            if (response.ok) {
                navigate('/list');
            } else {
                const { message } = await response.json();
                alert(message);
            }
        } catch (err) {
            console.error('로그인 처리 중 에러 발생:', err);
        }
    };

    console.log(id, pw);

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
                    value={id}
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
                    value={pw}
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
