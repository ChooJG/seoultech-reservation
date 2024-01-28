import React from 'react';
import './App.css';
import Login from './pages/login';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Reservation from './pages/reservation';
import List from './pages/list'
import MyPage from './pages/mypage';
import Header from './components/Header';
import { AuthContextProvider } from './AuthContext';
import AdminPanel from "./pages/admin";
//import RecordPanel from "./pages/records";
import Records from "./pages/records";
import Bookings from "./pages/bookings";

function App() {

    return (
        <BrowserRouter>
            <AuthContextProvider>
                <MainLayout />
            </AuthContextProvider>
        </BrowserRouter>
    );
}

function MainLayout() {
    return (
        <>
            <ConditionalHeader />
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/list' element={<List />} />
                <Route path="/reservation/:roomId" element={<Reservation />} />
                <Route path='/mypage' element={<MyPage />} />
                <Route path='/admin' element={<AdminPanel />} />
                <Route path='/records' element={<Records />} />
                <Route path='/bookings' element={<Bookings />} />
            </Routes>
        </>
    );
}

function ConditionalHeader() {
    let location = useLocation();

    // 로그인 페이지가 아닐 때만 Header 컴포넌트를 렌더링합니다.
    return location.pathname !== '/' ? <Header /> : null;
}

export default App;