import React, { useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./css/campingDetail.css";
import { useState } from "react";
import { useParams } from "react-router-dom";

const CampingDetail = () => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };
  // 상태 변수 정의
  const [campsite_id, setcampsite_id] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [campingInfo, setCampingInfo] = useState({});
  const { campgroundId } = useParams();
  const [error, setError] = useState(null);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [siteList, setSiteList] = useState([]);
  const [reservation, setReservation] = useState([]);
  const [mainPhoto, setMainPhoto] = useState("");
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    if (campgroundId) {
      fetchData();
      fetchReviews();
      fetchSites();
      fetchReservation();
      fetchMainPhoto();
      fetchAmenities();
    }
  }, [campgroundId]);

  //캠핑장 정보를 가져오는 함수
  const fetchData = () => {
    fetch(`http://localhost:3001/campingDetail/${campgroundId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCampingInfo(data);
        console.log("캠핑 정보: ", data);
      })
      .catch((error) => {
        setError(error.message || "An error occurred");
      });
  };
  //캠핑장 대표 사진을 가져오는 함수
  const fetchMainPhoto = () => {
    fetch(`http://localhost:3001/campingDetail/${campgroundId}/main_photo`)
      .then((response) => response.json())
      .then((data) => {
        setMainPhoto(data.main_photo);
      })
      .catch((error) => {
        console.log("An error occured: ", error);
      });
  };
  //시설 정보를 가져오는 함수
  const fetchAmenities = () => {
    fetch(`http://localhost:3001/campingDetail/${campgroundId}/amenities`)
      .then((response) => response.json())
      .then((data) => {
        setAmenities(data);
      })
      .catch((error) => {
        console.log("An error occured: ", error);
      });
  };

  //캠핑장 리뷰 데이터를 가져오는 함수
  const fetchReviews = () => {
    fetch(`http://localhost:3001/campingDetail/${campgroundId}/reviews`)
      .then((response) => response.json())
      .then((data) => {
        // campgroundId에 해당하는 리뷰만 필터링
        const filteredReviews = data.filter(
          (review) => review.campground_id === parseInt(campgroundId)
        );
        setReviews(filteredReviews);
      })
      .catch((err) => {
        console.log("An error occured: ", err);
      });
  };
  //캠핑장 사이트 데이터를 가져오는 함수
  const fetchSites = () => {
    fetch(`http://localhost:3001/campingDetail/${campgroundId}/campsite`)
      .then((response) => response.json())
      .then((data) => {
        setSiteList(data);
      })
      .catch((err) => {
        console.log("An error occured: ", err);
      });
  };
  //캠핑장 예약 정보를 가져오는 함수
  const fetchReservation = () => {
    fetch(`http://localhost:3001/campingDetail/${campgroundId}/reserve`)
      .then((response) => response.json())
      .then((data) => {
        setReservation(data);
        console.log("예약 정보: ", data);
      })
      .catch((err) => {
        console.log("An error occured: ", err);
      });
  };

  // 예약 처리 함수
  const handleReservation = (e) => {
    e.preventDefault();
    const reservationData = {
      campsite_id,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      adults,
      children,
      status,
      campgroundId,
    };
    fetch("http://localhost:3001/reserve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => response.json()) // JSON 응답을 파싱합니다.
      .then((data) => {
        console.log("Response from server:", data);

        if (data.success) {
          alert("예약이 완료되었습니다.");
          setcampsite_id("");
          setCheckInDate("");
          setCheckOutDate("");
          setAdults("");
          setChildren("");
          window.location.reload();
        } else {
          alert("해당 날짜는 예약되었습니다.");
        }
      })
      .catch((error) => {
        console.error("There was an error making the reservation!", error);
      });
  };

  // 사이트 클릭 핸들러 함수
  const handleSiteClick = (number) => {
    setcampsite_id(number);
  };

  //리뷰 등록
  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handlePhotoChange = (event) => {
    setPhoto(event.target.files[0]);
  };

  // 등록버튼을 눌렀을때
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("text", text);
    formData.append("photo", photo);

    fetch(`http://localhost:3001/campingDetail/${campgroundId}/reviews`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("리뷰 등록 실패");
        }
        return response.json();
      })
      .then((data) => {
        window.location.reload();
        alert("리뷰가 등록되었습니다.");
      })
      .catch((error) => {
        console.log("리뷰 등록 실패", error);
      });
  };

  return (
    <div className="camping_container">
      <div className="container">
        <div className="carousel-container">
          <Slider {...settings}>
            {mainPhoto && (
              <div key={mainPhoto}>
                <img src={require(`../../uploads/${mainPhoto}`)} alt="Main" />
              </div>
            )}

            {/* 추가 이미지를 원하시면 위의 형식을 따라 추가하십시오. */}
          </Slider>
        </div>
        <div className="reservation">
          <h2>캠핑장 예약</h2>
          <input
            type="text"
            placeholder="사이트 이름"
            value={campsite_id}
            onChange={(e) => setcampsite_id(e.target.value)}
          />
          <input
            type="date"
            placeholder="입실일"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
          <input
            type="date"
            placeholder="퇴실일"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
          />
          <input
            type="number"
            placeholder="성인 수"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
          />
          <input
            type="number"
            placeholder="어린이 수"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
          />

          <button onClick={handleReservation}>예약하기</button>
        </div>
        <div className="camping-info" id="camping-info">
          <h3>캠핑장 정보</h3>
          <p>
            <strong>{campgroundId}번 캠핑장:</strong> {campingInfo.name}
          </p>
          <p>
            <strong>숙소 소개:</strong> {campingInfo.description}
          </p>
          <p>
            <strong>주소:</strong> {campingInfo.address}
          </p>
          <p>
            <strong>연락처:</strong> {campingInfo.contact}
          </p>
          <p>
            <strong>입실:</strong> {campingInfo.check_in_time}
          </p>
          <p>
            <strong>퇴실:</strong> {campingInfo.check_out_time}
          </p>
          <p>
            <strong>매너타임:</strong> {campingInfo.manner_start_time} ~{" "}
            {campingInfo.manner_end_time}
          </p>
        </div>
      </div>
      <div className="site-list">
        {siteList.map((site, index) => (
          <div
            key={site.id}
            className="site-item"
            onClick={() => handleSiteClick(index + 1)}
          >
            <img src={require(`../../uploads/${site.photo}`)} alt="" />
            <div className="site-details">
              <p>
                <strong>{site.name}</strong>
              </p>
              <p>
                <strong>요금:</strong> {site.rate}원
              </p>
              <p>
                <strong>수용 인원:</strong> {site.capacity}
              </p>
              <p>
                <strong>상태: </strong>
                {reservation.some(
                  (reservation) =>
                    reservation.campsite_id === index + 1 &&
                    reservation.status === "Pending"
                )
                  ? "대기"
                  : "가능"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="facility-information">
        <h2>{campingInfo.name} 캠핑장</h2>
        <div className="facility-container">
          <div className="section">
            <h2>부대시설</h2>
            <ul>
              {amenities
                .filter((amenity) => amenity.type !== null)
                .map((amenity, index) => (
                  <li key={index} className="item">{amenity.type}</li>
                ))}
            </ul>
          </div>
          <div className="section">
            <h2>놀거리</h2>
            <ul>
              {amenities
                .filter((amenity) => amenity.play !== null)
                .map((amenity, index) => (
                  <li key={index} className="item">{amenity.play}</li>
                ))}
            </ul>
          </div>
          <div className="section">
            <h2>주변 환경</h2>
            <ul>
              {amenities
                .filter((amenity) => amenity.view !== null)
                .map((amenity, index) => (
                  <li key={index} className="item">{amenity.view}</li>
                ))}
            </ul>
          </div>
        </div>
      </div>
      <h2>{campingInfo.name} 리뷰 목록</h2>

      <div className="review-container">
        <div className="reviews">
          {reviews.map((review, index) => (
            <div key={index} className="review">
              <div className="review-info">
                <img
                  className="review-image"
                  src={require(`../../uploads/${review.photo}`)}
                  alt=""
                />
                <p className="review-text">{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2>리뷰 등록</h2>
      <form
        class="review-form"
        onSubmit={handleSubmit}
        enctype="multipart/form-data"
      >
        <textarea
          className="review-textarea"
          placeholder="리뷰를 입력하세요"
          value={text}
          onChange={handleTextChange}
        ></textarea>
        <input
          type="file"
          className="review-file-input"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        <button type="submit" class="review-submit-button">
          리뷰 등록
        </button>
      </form>
    </div>
  );
};

export default CampingDetail;