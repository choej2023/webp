import './css/Login.css'
import {useState} from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {REQUEST} from "../../config";

export default function Login() {
    const navigator = useNavigate();
    const [user, setUser] = useState({
        id: "",
        pw: ""
    })

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post(REQUEST.LOGIN, user).then(r => {
            if (r.status === 200) {
                const {user_id} = r.data;
                localStorage.setItem("user_id", user_id)
                navigator('/main')
            }
        }).catch(e => {
            console.log(e)
            alert('존재하지 않는 계정입니다.')
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className="loginForm">
                <legend>로그인</legend>
                <div>
                    <label>ID</label>
                    <input type="text"
                           name="id"
                           value={user.id}
                           onChange={handleChange}/>
                </div>
                <div>
                    <label>Password</label>
                    <input type="password"
                           name="pw"
                           value={user.pw}
                           onChange={handleChange}/>
                </div>
                <button type="submit">로그인</button>
            </fieldset>
        </form>
    )
}