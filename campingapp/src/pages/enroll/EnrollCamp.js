import "./EnrollCamp.css";
import {useState} from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {REQUEST} from "../../config";


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
        main_photo:"camping3.jpg"
    })

    const handleChange = (e) => {
        setEnroll({...enroll, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response1 = await axios.post(REQUEST.ENROLL, enroll);
            if (response1.data.success) {
                try {
                    console.log(response1.data);
                    const response2 = await axios.post(REQUEST.ENROLLTYPE, { campgroundType: enroll.campgroundType, id: response1.data.id });
                    console.log('Enroll2 response:', response2.data); // 응답 데이터 출력
                    if (response2.data.success) {
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
    }


  return (
    <form className="enrollForm" onSubmit={handleSubmit}>
    <div className="enrollContent">
      <div className="header">
        캠핑장 관리
      </div>

      <div className="photoContent">
        <div className="Photo">
          사진
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
        </div>
      </div>


      <div className="siteUpdate">
        사이트 등록창
      </div>


      <div className="siteModify">
        사이트 수정/삭제창
      </div>
    </div>
    <div className="button">
    <button type="submit">등록</button>
    </div>
    </form>
  );
};

export default EnrollCamp;