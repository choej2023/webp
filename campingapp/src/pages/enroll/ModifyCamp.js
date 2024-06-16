import "./EnrollCamp.css";
import {useEffect, useState} from "react";
import axios from 'axios';
import {useLocation, useNavigate} from "react-router-dom";
import {REQUEST} from "../../config";



const ModifyCamp = () => {
    //=======================================================
    // fetch data
    const location = useLocation()
    const {campgroundId, setCampgroundId} = location.state || {}
    const [campingInfo, setCampingInfo] = useState([]);
    const [campsiteInfo, setCampsiteInfo] = useState([]);
    const [Error,setError] = useState("");
    const [campType, setCampType] = useState({});
    
    useEffect(() => {
        if (campgroundId) {
            fetchSites();
            fetchType();
            fetchData();
            
        }
    }, [campgroundId]);
    console.log(campgroundId)

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCampingInfo({
          ...campingInfo,
          [name]: value
        });
      };
    const fetchData = () => {
        fetch(`http://localhost:8080/main/campingDetail/${campgroundId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            setCampingInfo(data);
          })
          .catch((error) => {
            setError(error.message || "An error occurred");
          });
      };


    //캠핑장 사이트 데이터를 가져오는 함수
    const fetchSites = () => {
        fetch(`http://localhost:8080/main/campingDetail/${campgroundId}/campsite`)
            .then((response) => response.json())
            .then((data) => {
                setCampsiteInfo(data);
            })
            .catch((err) => {
                console.log("An error occured: ", err);
            });
    };
    //캠핑장 타입 가져오는 함수
    const fetchType = () => {
        fetch(`http://localhost:8080/main/campingDetail/${campgroundId}/type`)
            .then((response) => response.json())
            .then((data) => {
                setCampType(data);
            })
            .catch((err) => {
                console.log("An error occured: ", err);
            });
    };

    const updateCampsiteInfo = () => {
        fetch(`http://localhost:8080/updateCampground/${campgroundId}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campingInfo),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            alert('캠핑장 정보가 성공적으로 업데이트되었습니다.');
          })
          .catch(error => {
            console.error('Error updating campsite info:', error);
          });
      };


    //=======================================================

    const navigator = useNavigate();
    //=======================================================
    //캠핑장 정보
    const [enroll, setEnroll] = useState({
        //캠핑장정보
        userId: localStorage.getItem("user_id"),
        campgroundType: campType, //타입
        name: campingInfo.name,
        description: campingInfo.description,
        address: campingInfo.address,
        contact: campingInfo.contact,
        check_in_time: campingInfo.check_in_time,
        check_out_time: campingInfo.check_out_time,
        manner_start_time: campingInfo.manner_start_time,
        manner_end_time: campingInfo.manner_end_time,
        main_photo: campingInfo.main_photo,
        amenities: campingInfo.amenities,
    })

    const siteObjects = campsiteInfo.map((site, index) => {
        return {
            name: `site${index}`,
            data: site
        };
    });
   
    //사이트정보
    const [campsite, setCampsite] = useState({
        site_name1: "",
        site_rate1: "",
        site_capacity1: "",
        site_photo1: null,

        site_name2: "",
        site_rate2: "",
        site_capacity2: "",
        site_photo2: null,

        site_name3: "",
        site_rate3: "",
        site_capacity3: "",
        site_photo3: null,

        site_name4: "",
        site_rate4: "",
        site_capacity4: "",
        site_photo4: null,
    })


    const handleChange = (e) => {
        e.preventDefault();
        setEnroll({...enroll, [e.target.name]: e.target.value})
        setCampsite({...campsite, [e.target.name]: e.target.value})
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (campgroundId) {
          updateCampsiteInfo();
        } else {
          console.error('campgroundId is null or undefined');
        }
      };
    //=======================================================

    return (
        <form className="enrollForm" onSubmit={handleSubmit}>
            <div className="enrollContent">
                <div className="header">
                    캠핑장 수정
                </div>
               
                <div className="photoContent">
                    <div className="Photo">
                        <img src={campingInfo.main_photo}></img>
                        캠핑장 사진 등록
                    </div>

                    <div className="info">
                        <label> 캠핑장 종류 :
                            <select
                                name="campgroundType"
                                value={enroll.campgroundType}
                                onChange={handleChange}
                            >
                                <option value="캠핑">캠핑</option>
                                <option value="글램핑">글램핑</option>
                                <option value="카라반">카라반</option>
                                <option value="카라반">캠핑, 글램핑</option>
                                <option value="카라반">캠핑, 카라반</option>
                                <option value="카라반">글램핑, 카라반</option>
                                <option value="카라반">캠핑, 글램핑, 카라반</option>
                            </select>
                        </label>
                        <label> 이름 :
                            <input type="text" name="name"
                                   value={campingInfo.name}
                                   onChange={handleInputChange}
                            />
                        </label>
                        <label> 숙소소개 :
                            <input type="text" name="description"
                                   value={campingInfo.description}
                                   onChange={handleInputChange}
                            />
                        </label>
                        <label> 주소 :
                            <input type="text" name="address"
                                   value={campingInfo.address}
                                   onChange={handleInputChange}
                            />
                        </label>
                        <label> 연락처 :
                            <input type="text" name="contact"
                                   value={campingInfo.contact}
                                   onChange={handleInputChange}
                            />
                        </label>
                        <div className="checkInOut">
                            <label> 체크인 시간 :
                                <input type="time" name="check_in_time"
                                       value={campingInfo.check_in_time}
                                       onChange={handleInputChange}
                                />
                            </label>
                            <label> 체크아웃 시간 :
                                <input type="time" name="check_out_time"
                                       value={campingInfo.check_out_time}
                                       onChange={handleInputChange}
                                />
                            </label>
                        </div>
                        <div className="checkInOut">
                            <label> 매너타임 시작 시간 :
                                <input type="time" name="manner_start_time"
                                       value={campingInfo.manner_start_time}
                                       onChange={handleInputChange}
                                />
                            </label>
                            <label> 매너타임 종료 시간 :
                                <input type="time" name="manner_end_time"
                                       value={campingInfo.manner_end_time}
                                       onChange={handleInputChange}
                                />
                            </label>
                        </div>
                        <label> 부대시설 :
                            <input type="text" name="emenities"
                                   value={campingInfo.emenities}
                                   onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div className="button">
                        <button type="submit">수정</button>
                    </div>
                    
                </div>
             

                <div className="siteUpdate">
                    <div className="siteUpdate1">
                        <div className="sitePhoto">
                            <div>첫번째</div>
                            사이트 사진 등록하기
                        </div>
                        <label> 사이트 이름 :
                            <input type="text" name="site_name1"
                                   value={campsite.site_name1}
                                   onChange={handleChange}
                            />
                        </label>
                    

                        <label> 사이트 요금 :
                            <input type="text" name="site_rate1"
                                   value={campsite.site_rate1}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 수용인원 :
                            <input type="number" name="site_capacity1"
                                   value={campsite.site_capacity1}
                                   onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className="siteUpdate2">
                        <div className="sitePhoto">
                            <div>두번째</div>
                            사이트 사진 등록하기
                        </div>
                        <label> 사이트 이름 :
                            <input type="text" name="site_name2"
                                   value={campsite.site_name2}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 요금 :
                            <input type="text" name="site_rate2"
                                   value={campsite.site_rate2}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 수용인원 :
                            <input type="number" name="site_capacity2"
                                   value={campsite.site_capacity2}
                                   onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className="siteUpdate3">
                        <div className="sitePhoto">
                            <div>세번째</div>
                            사이트 사진 등록하기
                        </div>
                        <label> 사이트 이름 :
                            <input type="text" name="site_name3"
                                   value={campsite.site_name3}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 요금 :
                            <input type="text" name="site_rate3"
                                   value={campsite.site_rate3}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 수용인원 :
                            <input type="number" name="site_capacity3"
                                   value={campsite.site_capacity3}
                                   onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className="siteUpdate4">
                        <div className="sitePhoto">
                            <div> 네번째</div>
                            사이트 사진 등록하기
                        </div>
                        <label> 사이트 이름 :
                            <input type="text" name="site_name4"
                                   value={campsite.site_name4}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 요금 :
                            <input type="text" name="site_rate4"
                                   value={campsite.site_rate4}
                                   onChange={handleChange}
                            />
                        </label>
                        <label> 사이트 수용인원 :
                            <input type="number" name="site_capacity4"
                                   value={campsite.site_capacity4}
                                   onChange={handleChange}
                            />
                        </label>
                    </div>

                </div>

            </div>
            </form>  
        
    );
};

export default ModifyCamp;