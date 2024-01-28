import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // 닫기 버튼 스타일을 포함한 스타일시트 업데이트 필요
import axios from "axios";

function Header() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);

    const handleLogin = () => {
        axios.get('http://localhost:3001/auth/isLogin',
            { withCredentials: true })
            .then(response => {
                const role = response.data.role;
                if(role === 'admin'){
                    const isAdmin = true;
                    setIsAdmin(isAdmin);
                }
            })
            .catch(error => {
                //console.error('Login error:', error);
            });
    };

    function goLogout() {
        axios.get('http://localhost:3001/auth/logout',
                { withCredentials: true })
                .then(response => {
                    //console.log('로그아웃 성공');
                    navigate('/')
                })
                .catch(error => {
                    //console.error('로그아웃 요청 중 오류 발생:', error);
                });
    }

    const redirectToHome = () => {
        navigate('/list'); // 클릭 시 /list 경로로 이동
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen); // 메뉴 상태 토글
        handleLogin();
    };

    const navigateTo = (path) => {
        navigate(path);
        toggleMenu(); // 메뉴를 닫습니다.
    };

    return (
        <header className="header">
            <div onClick={redirectToHome} className="header-content">
                <img src="/Seoultech_LOGO.png" alt="Seoultech Logo" className="header-logo" />
                <div className="header-title"><b>창업보육센터</b></div>
            </div>
            <button className="menu-button" onClick={toggleMenu}>
                {/* 메뉴 버튼 아이콘입니다. 실제 아이콘으로 교체해주세요. */}
                ☰
            </button>
            {/* 전체 화면에 걸쳐 나타나는 슬라이딩 메뉴 */}
            <div className={`menu-bar ${isMenuOpen ? 'open' : ''}`}>
                {/* 메뉴 닫기 버튼 */}
                <button className="close-button" onClick={toggleMenu}>×</button>
                <nav className="menu-navigation">
                    <ul>
                        <li onClick={() => navigateTo('/list')}>회의실 예약</li>
                        <li onClick={() => navigateTo('/mypage')}>나의 예약현황</li>
                        {isAdmin && <li onClick={() => navigateTo('/admin')}>관리자 페이지</li>}
                        <li onClick={() => goLogout()}>로그아웃</li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
