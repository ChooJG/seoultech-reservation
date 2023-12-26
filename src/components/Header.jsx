import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Header 컴포넌트에 대한 스타일시트

function Header() {
    const navigate = useNavigate();

    const redirectToHome = () => {
        navigate('/list'); // 클릭 시 /list 경로로 이동
    };

    return (
        <header className="header">
            <div onClick={redirectToHome} className="header-content">
                <img src="/Seoultech_LOGO.png" alt="Seoultech Logo" className="header-logo" />
                <div className="header-title" ><b>창업보육센터</b></div>
            </div>
            <button className="menu-button">
                {/* 메뉴 버튼 아이콘입니다. 실제 아이콘으로 교체해주세요. */}
                ☰
            </button>
        </header>
    );
}

export default Header;
