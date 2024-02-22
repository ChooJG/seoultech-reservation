// AdminPanel.js

import React, { useState, useEffect } from 'react';
import './Admin.css';
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AdminPanel = () => {

    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3001/auth/isLogin'
            , { withCredentials: true }) // 서버의 로그인 상태 확인 엔드포인트
            .then(response => {
                if (response.data.isAuthenticated && response.data.role === "admin") {
                    setIsLoggedIn(true);
                } else {
                    navigate('/'); // 로그인 페이지로 리디렉션
                }
            })
            .catch(error => {
                //console.error('로그인 상태 확인 중 오류 발생:', error);
                navigate('/'); // 오류 발생 시 로그인 페이지로 리디렉션
            });
    }, [navigate]);

    useEffect(() => {
        let isMounted = true;   // 컴포넌트 마운트 상태를 나타내는 변수

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/admin/showUsers', { withCredentials: true });

                if (isMounted) {  // 컴포넌트가 마운트 상태인 경우에만 상태를 업데이트
                    setUsers(response.data);
                }
            } catch (error) {
                //console.error('Error fetching users:', error);
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;  // 컴포넌트가 언마운트되면 isMounted를 false로 설정
        };
    }, []);


    if (!isLoggedIn) {
        return <div>now loading...</div>;
    }

    const handleIdChange = (id, newCompanyName) => {
        // 회사명 및 패스워드 변경 로직
        if (!newCompanyName) {
            alert("새로운 회사명을 입력하세요");
            return;
        }

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        axios.post('http://localhost:3001/admin/updateUser',
            { newCompanyName, id },
            { withCredentials: true, cancelToken: source.token })
            .then(response => {
                if (response.status === 409) {
                    alert("이미 존재하는 회사명입니다.")
                }
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    if (error.response.status === 409) {
                        alert("이미 존재하는 회사명입니다.");
                        return;
                    }
                    //console.error('Error fetching users:', error);
                }
            })
            .finally(() => {
                axios.get('http://localhost:3001/admin/showUsers',
                    { withCredentials: true, cancelToken: source.token })
                    .then(response => {
                        setUsers(response.data);
                    })
                    .catch(error => {
                        if (axios.isCancel(error)) {
                            console.log('Request canceled', error.message);
                        } else {
                            //console.error('Error fetching users:', error);
                        }
                    });
            });

        return () => {
            source.cancel('Operation canceled by the user.');
        }
    };


    const handlePwChange = (id, newCompanyPw) => {
        if (!newCompanyPw || newCompanyPw === "") {
            alert("새로운 비밀번호를 입력하세요");
            return;
        }

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        axios.post('http://localhost:3001/admin/updateUserPw',
            { newCompanyPw, id },
            { withCredentials: true, cancelToken: source.token })
            .then(response => {
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    // handle other errors
                }
            })
            .finally(() => {
                axios.get('http://localhost:3001/admin/showUsers',
                    { withCredentials: true, cancelToken: source.token })
                    .then(response => {
                        setUsers(response.data);
                    })
                    .catch(error => {
                        if (axios.isCancel(error)) {
                            console.log('Request canceled', error.message);
                        } else {
                            //console.error('Error fetching users:', error);
                        }
                    });
            });
    }



    const handleDelete = (id) => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        axios.post('http://localhost:3001/admin/deleteUser',
            { id },
            { withCredentials: true, cancelToken: source.token })
            .then(response => {
                if(response.status === 409){
                    alert("하나 이상의 관리자 계정이 존재해야 합니다.");
                }
                else {
                    alert("유저가 삭제되었습니다.");
                }
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    if(error.response.status === 409){
                        alert("하나 이상의 관리자 계정이 존재해야 합니다.");
                    }
                    else {
                        alert("서버에서 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
                    }
                }
            })
            .finally(() => {
                axios.get('http://localhost:3001/admin/showUsers',
                    { withCredentials: true, cancelToken: source.token })
                    .then(response => {
                        setUsers(response.data);
                    })
                    .catch(error => {
                        if (axios.isCancel(error)) {
                            console.log('Request canceled', error.message);
                        } else {
                            //console.error('Error fetching users:', error);
                        }
                    });
            });
    }


    const handleRecords = () => {
        navigate('/bookings');
    }

    const handleAddUser = () => {

        const newUser = prompt("새로운 회사 명을 입력하세요 (최대 20자)");
        const newUserPw = prompt("새로운 비밀번호를 입력하세요 (최대 20자)");

        if (!newUser || !newUserPw){
            alert("새로운 회사 명과 비밀번호를 입력해 주세요");
            return;
        }
        axios.post('http://localhost:3001/admin/join',
            {newUser, newUserPw},
            { withCredentials: true })
            .then(response => {
                if(response.status === 409){
                    alert("이미 존재하는 회사명입니다.");
                }
                else{
                    alert("유저가 추가되었습니다.");
                }
                axios.get('http://localhost:3001/admin/showUsers',
                    { withCredentials: true })
                    .then(response => {
                        setUsers(response.data);
                    })
                    .catch(error => {
                        //console.error('Error fetching users:', error);
                    });
            })
            .catch(error => {
                if(error.response.status === 409){
                    alert("이미 존재하는 회사명입니다.");
                }
                else{
                    alert("서버에서 오류가 발생하였습니다. 잠시 후 다시 시도해주세요")
                }
                //console.error('Error fetching users:', error);
            });


    };

    const handleDownloadActivity = async (user) => {
        // 활동 내역 다운로드 로직
        alert(`${user.companyName} 회의실 예약 현황을 다운로드 합니다.`);

        try {
            // 서버에 파일 다운로드 요청을 보냅니다.
            const response = await axios({
                url: 'http://localhost:3001/admin/infoDown',
                method: 'POST',
                data: { id: user.id },
                withCredentials: true,
                responseType: 'blob', // important
            });

            if(response.status === 404){
                alert("예약 내역이 없습니다.")
                return;
            }

            // 서버로부터 받은 파일을 다운로드 합니다.
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');

            const csv_name = user.companyName + '_reservations.xlsx';

            link.href = url;
            link.setAttribute('download', csv_name); // 다운로드 받을 파일의 이름입니다.
            document.body.appendChild(link);
            link.click();

        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert("예약 내역이 없습니다");
                return;
            }
            //console.error(`Error: ${error}`);  // 요청이 실패하면 콘솔에 에러 메시지를 출력합니다.
        }

    };

    const handleViewActivity = async (user) => {
        navigate('/records', { state: { user } });
    }

    return (
        <div className="container">
            <h1>관리자 페이지</h1>
            <div className="tableMargin">
            <table>
                <thead>
                <tr>
                    <th>회사명</th>
                    <th>비밀번호</th>
                    <th>계정변경</th>
                    <th>계정삭제</th>
                    <th>활동내역</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.companyName}</td>
                        <td>{user.password}</td>
                        <td>
                            <button onClick={() => {
                                const newCompanyName = prompt('새로운 회사명을 입력하세요:');
                                if (newCompanyName) {
                                    handleIdChange(user.id, newCompanyName);
                                }
                            }}>ID변경</button>
                            <button onClick={() => {
                                const newCompanyPw = prompt('새로운 비밀번호를 입력하세요:');
                                if (newCompanyPw) {
                                    handlePwChange(user.id, newCompanyPw);
                                }
                            }}>PW변경</button>
                        </td>
                        <td>
                            <button onClick={() => {
                                const confirmDelete = window.confirm('정말로 이 계정을 삭제하시겠습니까?');
                                if (confirmDelete) {
                                    handleDelete(user.id);
                                }
                            }}>삭제</button>
                        </td>
                        <td>
                            <button onClick={() => handleViewActivity(user)}>보기</button>
                            <button onClick={() => handleDownloadActivity(user)}>다운로드</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            <button className="download-button"
            onClick={ () => handleAddUser() }>유저 추가</button>
            <button className="download-button"
                    onClick={ () => handleRecords() }>전체 활동 내역</button>
            <br/><br/><br/><br/><br/>
        </div>
    );
};

export default AdminPanel;