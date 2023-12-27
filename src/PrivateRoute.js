// PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PrivateRoute = ({ element: Component, ...rest }) => {
    const [isLoading, setLoading] = useState(true);
    const [isAuthenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/auth/isLogin', { withCredentials: true })
            .then(response => {
                setAuthenticated(response.data.isAuthenticated);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [navigate]);

    if (isLoading) {
        return <div>Loading...</div>; // 로딩 상태 표시
    }

    return (
        <Route {...rest} element={
            isAuthenticated ? (
                <Component />
            ) : (
                navigate('/login')
            )
        } />
    );
};

export default PrivateRoute;
