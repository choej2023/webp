import './css/Main.css'
import TopBar from "./component/TopBar";
import React, { useEffect, useState} from "react";
import CampgroundList from "./component/CampgroundList";
import axios from "axios";
import {REQUEST} from "../../config";
import {useNavigate} from "react-router-dom";

export default function Main() {
    const [formData, setFormData] = useState({
        name: '',
        checkIn: '',
        checkOut: '',
        address: '',
        type: '',
    })
    const [list, setList] = useState([])
    const navigator = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted", formData);
        axios.post(REQUEST.FILTER, formData)
            .then((response) => {
                setList(response.data);
                console.log(response);
            }).catch(e => {
            console.log(e);
        });
    };


    useEffect(() => {
        axios.post(REQUEST.FILTER, formData)
            .then((response) => {
                setList(response.data);
                console.log(response);
            }).catch(e => {
            console.log(e);
        });
    }, [])

    const logout = () => {
        localStorage.clear()
        navigator('/')
    };

    return (
        <div className="container2">
            <div className="upper-menu">
                <button onClick={() => navigator('/EnrollCamp')}>캠핑장 등록</button>
                <button onClick={() => navigator('/myPage')}>마이페이지</button>
                <button onClick={logout}>로그아웃</button>
            </div>
            <TopBar formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
            />
            <CampgroundList list={list}/>
        </div>
    )
}