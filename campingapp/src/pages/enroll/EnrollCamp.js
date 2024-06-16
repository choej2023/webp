import "./EnrollCamp.css";
import React, {useState} from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {REQUEST} from "../../config";
import enrollCamp from "./EnrollCamp";


const EnrollCamp = () => {
    const navigator = useNavigate();
    const [enroll, setEnroll] = useState({
        userId: localStorage.getItem("user_id"),
        campgroundType: "",
        name: "",
        description: "",
        address: "",
        contact: "",
        check_in_time: "",
        check_out_time: "",
        manner_start_time: "",
        manner_end_time: "",
        main_photo: null,
        amenities: "",
    })
    //사이트정보
    const [campsite, setCampsite] = useState({
        site_name1: "",
        site_rate1: "",
        site_capacity1: "",
        site_photo1: "reviewSample.jpg",

        site_name2: "",
        site_rate2: "",
        site_capacity2: "",
        site_photo2: "reviewSample.jpg",

        site_name3: "",
        site_rate3: "",
        site_capacity3: "",
        site_photo3: "reviewSample.jpg",

        site_name4: "",
        site_rate4: "",
        site_capacity4: "",
        site_photo4: "reviewSample.jpg",
    })

    const handleChange = (e) => {
        setEnroll({...enroll, [e.target.name]: e.target.value})
        setCampsite({...campsite, [e.target.name]: e.target.value})
    }

    const handlePhotoChange = (event) => {
        setEnroll({...enroll, main_photo: event.target.files[0]});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            for (const key in enroll) {
                formData.append(key, enroll[key]);
            }

            const response1 = await axios.post(REQUEST.ENROLL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response1.data.success) {
                try {
                    console.log(response1.data);
                    const response2 = await axios.post(REQUEST.ENROLLTYPE, {
                        campgroundType: enroll.campgroundType,
                        id: response1.data.id
                    });
                    console.log('Enroll2 response:', response2.data); // 응답 데이터 출력
                    if (response2.data.success) {
                        //사이트 등록
                        try{
                            const responseSite1 = await axios.post(REQUEST.SITE, { campId: response1.data.id, name: campsite.site_name1, rate: campsite.site_rate1, capacity: campsite.site_capacity1, photo: campsite.site_photo1});
                            if(responseSite1.data.success) {console.log("사이트1 등록 성공")}
                        } catch (e){
                            console.error(e);
                        }
                        try{
                            const responseSite2 = await axios.post(REQUEST.SITE, { campId: response1.data.id, name: campsite.site_name2, rate: campsite.site_rate2, capacity: campsite.site_capacity2, photo: campsite.site_photo2});
                            if(responseSite2.data.success) {console.log("사이트2 등록 성공")}
                        } catch (e){
                            console.error(e);
                        }
                        try{
                            const responseSite3 = await axios.post(REQUEST.SITE, { campId: response1.data.id, name: campsite.site_name3, rate: campsite.site_rate3, capacity: campsite.site_capacity3, photo: campsite.site_photo3});
                            if(responseSite3.data.success) {console.log("사이트3 등록 성공")}
                        } catch (e){
                            console.error(e);
                        }
                        try{
                            const responseSite4 = await axios.post(REQUEST.SITE, { campId: response1.data.id, name: campsite.site_name4, rate: campsite.site_rate4, capacity: campsite.site_capacity4, photo: campsite.site_photo4});
                            if(responseSite4.data.success) {console.log("사이트4 등록 성공")}
                        } catch (e){
                            console.error(e);
                        }
                        navigator('/main');
                    }
                } catch (e) {
                    console.error(e);
                    alert('타입등록 실패.');
                }
            }
        } catch (e) {
            console.error(e);
            alert('정보등록 실패.');
        }
    };


    return (
        <form className="enrollForm" onSubmit={handleSubmit}>
            <div className="enrollContent">
                <div className="header">
                    캠핑장 관리
                </div>

                <div className="photoContent">
                    <div className="Photo">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </div>

        <div className="info">
          <label> 캠핑장 종류 :
          <select
            name="campgroundType"
            value={enroll.campgroundType}
            onChange={handleChange}
          >
            <option value="">캠핑장 종류를 선택하세요</option>
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
            value={enroll.name}
            onChange={handleChange}
            />
          </label>
          <label> 숙소소개 :
            <input type="text" name="description"
            value={enroll.description}
            onChange={handleChange}
            />
          </label>
          <label> 주소 :
            <input type="text" name="address"
            value={enroll.address}
            onChange={handleChange}
            />
          </label>
          <label> 연락처 :
            <input type="text" name="contact"
            value={enroll.contact}
            onChange={handleChange}
            />
          </label>
          <div className="checkInOut">
          <label> 체크인 시간 :
            <input type="time" name="check_in_time"
            value={enroll.check_in_time}
            onChange={handleChange}
            />
          </label>
          <label> 체크아웃 시간 :
            <input type="time" name="check_out_time"
            value={enroll.check_out_time}
            onChange={handleChange}
            />
          </label>
          </div>
          <div className="checkInOut">
          <label> 매너타임 시작 시간 :
            <input type="time" name="manner_start_time"
            value={enroll.manner_start_time}
            onChange={handleChange}
            />
          </label>
          <label> 매너타임 종료 시간 :
            <input type="time" name="manner_end_time"
            value={enroll.manner_end_time}
            onChange={handleChange}
            />
          </label>
          </div>
          <label> 부대시설 :
            <input type="text" name="emenities"
            value={enroll.emenities}
            onChange={handleChange}
            />
          </label>
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
    <div className="button">
    <button type="submit">등록</button>
    </div>
    </form>
  );
};

export default EnrollCamp;