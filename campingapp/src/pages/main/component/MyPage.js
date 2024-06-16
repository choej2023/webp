import React, { useEffect, useState } from 'react';

const MyPage = () => {
  const [userData, setUserData] = useState([]);
  const [newReview, setNewReview] = useState([]);

  useEffect(() => {
    fetchReviews();
    fetchReservation();
  }, []);

  const fetchReviews = () => {
    fetch("http://localhost:8080/MyPage/reviews")
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
    fetch("http://localhost:8080/MyPage/reservations")
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        console.log(data);
      })
      .catch((error) => {
        console.log("An error occurred: ", error);
      });
  };

  const handleCancelReservation = (reservation_id, campsite_id) => {
    fetch(`http://localhost:8080/main/MyPage/cancel/${campsite_id}/${reservation_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          // 성공적으로 예약 취소되면 userData에서 해당 예약을 제거합니다.
          setUserData(prevData => prevData.filter(item => item.reservation_id !== reservation_id));
          console.log("Reservation canceled successfully.");
        } else {
          console.error("Failed to cancel reservation.");
        }
      })
      .catch(error => {
        console.error("An error occurred while canceling reservation:", error);
      });
  };

  return (
    <div>
      <h1>My Page</h1>

      <h2>Reservations</h2>
      {userData.map((data, index) => (
  <div key={index} style={{ flex: '1 1 300px', margin: '10px', padding: '15px', border: '1px solid #ccc' }}>
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      <li key={data.id}>
        <p>사이트 번호: {data.campsite_id}</p>
        <p>유저 번호: {data.user_id}</p>
        <p>성인 수: {data.adults}</p>
        <p>어린이 수: {data.children}</p>
        <p>입실일: {data.check_in_date}</p>
        <p>퇴실일: {data.check_out_date}</p>
        <p>예약 상태: {data.status}</p>
        <button onClick={() => handleCancelReservation(data.reservation_id, data.campsite_id)}>예약 취소</button>
      </li>
    </ul>
  </div>
))}

      <h2>Reviews</h2>
      {newReview.map((review, index) => (
  <div key={index}>
    <p>{review.text}</p>
    <img src={review.photo} alt="Review" />
  </div>
))}
    </div>
  );
};

export default MyPage;