import React, {useEffect, useState} from 'react';
import axios from "axios";
import {REQUEST} from "../../../config";

const MyPage = () => {
    const [userData, setUserData] = useState([]);
    const [reservCamp, setReservCamp] = useState();
    const [newReview, setNewReview] = useState([]);

    useEffect(() => {
        fetchReviews();
        fetchReservation();
        axios.get(REQUEST.RESERVCAMP, {params: {user_id: localStorage.getItem("user_id")}}).then(
            res => {
                setReservCamp(res.data);
            }
        ).catch(e => {
            console.error(e);
        });
    }, []);

    const fetchReviews = () => {
        fetch(`http://localhost:8080/MyPage/reviews/${localStorage.getItem('user_id')}`)
            .then(response => response.json())
            .then(data => {
                setNewReview(data);
                console.log(data);
            })
            .catch((error) => {
                console.log("An error occurred: ", error);
            });
    };

    const fetchReservation = () => {
        fetch(`http://localhost:8080/MyPage/reservations/${localStorage.getItem("user_id")}`)
            .then(response => response.json())
            .then(data => {
                setUserData(data);
                console.log(data);
            })
            .catch((error) => {
                console.log("An error occurred: ", error);
            });
    };

    const handleCancelReservation = (reservation_id, campsite_id, check_in_date) => {
        const today = new Date();
        const checkInDate = new Date(check_in_date);

        if (today > checkInDate) {
            alert("이미 입실한 예약은 취소할 수 없습니다.");
            return;
        }

        fetch(`http://localhost:8080/main/MyPage/cancel/${campsite_id}/${reservation_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    setUserData(prevData =>
                        prevData.map(item =>
                            item.reservation_id === reservation_id ? {...item, status: 'Cancelled'} : item
                        )
                    );
                    setReservCamp(prevData =>
                        prevData.map(item =>
                            item.reservation_id === reservation_id ? {...item, status: 'Cancelled'} : item
                        )
                    );
                    console.log("Reservation canceled successfully.");
                } else {
                    console.error("Failed to cancel reservation.");
                }
            })
            .catch(error => {
                console.error("An error occurred while canceling reservation:", error);
            });

    };

    const formatDate = (dateString) => {
        const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
        return new Date(dateString).toLocaleDateString('en-CA', options);
    };

    const handleAcceptReservation = (reservation_id, campsite_id) => {
        axios.post(REQUEST.ACCEPT_RESERV, {reservation_id, campsite_id})
            .then(res => {
                console.log('Reservation confirmed:', res.data);
                setUserData(prevData =>
                    prevData.map(item =>
                        item.reservation_id === reservation_id
                            ? {...item, status: 'Confirmed'}
                            : item
                    )
                );
                setReservCamp(prevData =>
                    prevData.map(item =>
                        item.reservation_id === reservation_id
                            ? {...item, status: 'Confirmed'}
                            : item
                    )
                );
            })
            .catch(err => {
                console.error(err);
            });
    };

    return (
        <div>
            <h1>My Page</h1>

            <h2>My Reservations</h2>
            {userData.map((data, index) => (
                <div key={index} style={{flex: '1 1 300px', margin: '10px', padding: '15px', border: '1px solid #ccc'}}>
                    <ul style={{listStyleType: 'none', padding: 0}}>
                        <li key={data.id}>
                            <p>사이트 번호: {data.campsite_id}</p>
                            <p>유저 번호: {data.user_id}</p>
                            <p>성인 수: {data.adults}</p>
                            <p>어린이 수: {data.children}</p>
                            <p>입실일: {formatDate(data.check_in_date)}</p>
                            <p>퇴실일: {formatDate(data.check_out_date)}</p>
                            <p>예약
                                상태: {formatDate(data.check_out_date) <= formatDate(new Date()) ? "Ended" : data.status}</p>
                            {formatDate(data.check_out_date) <= formatDate(new Date()) ?
                                <button>
                                    후기 작성
                                    {/*여기에 후기 작성 기능 가져오기*/}
                                </button>
                                :
                                data.status === 'Cancelled' ?
                                    null
                                    :
                                    <button
                                        onClick={() => handleCancelReservation(data.reservation_id, data.campsite_id, data.check_in_date)}>예약
                                        취소
                                    </button>
                            }
                        </li>
                    </ul>
                </div>
            ))}

            <h2>Reservations of My Camp</h2>
            {reservCamp && reservCamp.map((data, index) => (
                <div key={index} style={{flex: '1 1 300px', margin: '10px', padding: '15px', border: '1px solid #ccc'}}>
                    <ul style={{listStyleType: 'none', padding: 0}}>
                        <li key={data.id}>
                            <p>사이트 번호: {data.campsite_id}</p>
                            <p>유저 번호: {data.user_id}</p>
                            <p>성인 수: {data.adults}</p>
                            <p>어린이 수: {data.children}</p>
                            <p>입실일: {formatDate(data.check_in_date)}</p>
                            <p>퇴실일: {formatDate(data.check_out_date)}</p>
                            <p>예약
                                상태: {formatDate(data.check_out_date) <= formatDate(new Date()) ? "Ended" : data.status}</p>
                            {formatDate(data.check_out_date) <= formatDate(new Date()) ||
                            data.status === 'Cancelled' ? null :
                                <div>
                                    {data.status === 'Confirmed' ? null
                                        :
                                        <button
                                            onClick={() => handleAcceptReservation(data.reservation_id, data.campsite_id)}>예약
                                            수락
                                        </button>
                                    }
                                    <button
                                        onClick={() => handleCancelReservation(data.reservation_id, data.campsite_id, data.check_in_date)}>예약
                                        취소
                                    </button>
                                </div>}

                        </li>
                    </ul>
                </div>
            ))}

            <h2>My Reviews</h2>
            {newReview.map((review, index) => (
                <div key={index}>
                    <p>{review.text}</p>
                    <img src={review.photo} alt="Review"/>
                </div>
            ))}
        </div>
    );
};

export default MyPage;
