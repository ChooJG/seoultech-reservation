// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({
    isLoggedIn: false,
    userRole: null, // 'user' 또는 'admin'
    setIsLoggedIn: () => {},
    setUserRole: () => {}
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthContextProvider = (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3001/auth/isLogin',
            { withCredentials: true })
            .then(response => {
                if (response.data.isAuthenticated) {
                    setIsLoggedIn(true);
                    setUserRole(response.data.role); // 사용자 권한 설정
                } else {
                    setIsLoggedIn(false);
                    setUserRole(null);
                }
            })
            .catch(error => {
                console.error('로그인 상태 확인 중 오류 발생:', error);
                setIsLoggedIn(false);
                setUserRole(null);
            });
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, setIsLoggedIn, setUserRole }}>
            {props.children}
        </AuthContext.Provider>
    );
};
