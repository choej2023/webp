import "./EnrollCamp.css";
import React, {useEffect, useState} from "react";
import axios from 'axios';
import {useLocation, useNavigate} from "react-router-dom";
import {baseURL, REQUEST} from "../../config";
import campingDetail from "../detail/CampingDetail";



const ModifyCamp = () => {
    //=======================================================
    // fetch data
    const location = useLocation()
    const {campgroundId} = location.state || {}
    const [campingInfo, setCampingInfo] = useState({});
    const { siteList } = location.state || [];
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
              }else{
                  return response.json();
              }

          })
          .then((data) => {
            setCampingInfo(data);
          })
          .catch((error) => {
            console.log(error)
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

    const updateCampsiteInfo = async () => {
        try {
            const formData = new FormData();
            for (const key in campingInfo) {
                if (key === 'main_photo' && campingInfo[key] instanceof File) {
                    formData.append('main_photo', campingInfo[key]);
                } else {
                    formData.append(key, campingInfo[key]);
                }
            }

            console.log('FormData contents:');
            formData.forEach((value, key) => {
                console.log(key, value);
            });

            const response = await axios.put(`${baseURL}/updateCampground/${campgroundId}/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                alert('캠핑장 정보가 성공적으로 업데이트되었습니다.');
                navigator(-1);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error updating campsite info:', error);
        }
    };


    const handlePhotoChange = (e, siteNumber) => {
        const file = e.target.files[0];
        if (siteNumber) {
            setCampsite((prev) => ({ ...prev, [`site_photo${siteNumber}`]: file }));
        } else {
            setCampingInfo((prev) => ({ ...prev, main_photo: file }));
        }
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

    siteList.push({name:"", rate:"", capacity:"", photo:null});
    siteList.push({name:"", rate:"", capacity:"", photo:null});
    siteList.push({name:"", rate:"", capacity:"", photo:null});
    siteList.push({name:"", rate:"", capacity:"", photo:null});

    // 사이트 정보
    const [campsite, setCampsite] = useState({
        site_name1: siteList[0].name,
        site_rate1: siteList[0].rate,
        site_capacity1: siteList[0].capacity,
        site_photo1: siteList[0].photo,

        site_name2: siteList[1].name,
        site_rate2: siteList[1].rate,
        site_capacity2: siteList[1].capacity,
        site_photo2: siteList[1].photo,

        site_name3: siteList[2].name,
        site_rate3: siteList[2].rate,
        site_capacity3: siteList[2].capacity,
        site_photo3: siteList[2].photo,

        site_name4: siteList[3].name,
        site_rate4: siteList[3].rate,
        site_capacity4: siteList[3].capacity,
        site_photo4: siteList[3].photo,
    })


    const handleChange = (e) => {
        e.preventDefault();
        setCampingInfo({...campingInfo, [e.target.name]: e.target.value})
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
                        <img
                            src={
                                campingInfo.main_photo && typeof campingInfo.main_photo === 'string'
                                    ? campingInfo.main_photo
                                    : campingInfo.main_photo
                                        ? URL.createObjectURL(campingInfo.main_photo)
                                        : ''
                            }
                            alt=""
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoChange(e)}
                        />
                    </div>

                    <div className="info">
                        <label> 캠핑장 종류 :
                            <select
                                name="campgroundType"
                                value={campingInfo.campgroundType}
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
                            <input type="text" name="amenities"
                                   value={campingInfo.amenities}
                                   onChange={handleInputChange}
                            />
                        </label>
                    </div>
                </div>


                <div className="siteUpdate">
                    <div className="siteUpdate1">
                        <div className="sitePhoto">
                            <div>첫번째</div>
                            <img src={campsite.site_photo1} alt=""/>
                            <input
                                type="file"
                                name="site_photo1"
                                accept="image/*"
                                onChange={(e) => handlePhotoChange(e, 1)}
                            />
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
                            <img src={campsite.site_photo2} alt=""/>
                            <input
                                type="file"
                                name="site_photo2"
                                accept="image/*"
                                onChange={(e) => handlePhotoChange(e, 2)}
                            />
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
                            <img src={campsite.site_photo3} alt=""/>
                            <input
                                type="file"
                                name="site_photo3"
                                accept="image/*"
                                onChange={(e) => handlePhotoChange(e, 3)}
                            />
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
                            <img src={campsite.site_photo4} alt=""/>
                            <input
                                type="file"
                                name="site_photo4"
                                accept="image/*"
                                onChange={(e) => handlePhotoChange(e, 4)}
                            />
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
            <div className="button">
                <button type="submit">수정</button>
            </div>
        </form>
    );
};

export default ModifyCamp;