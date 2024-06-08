import './App.css';
import Login from './pages/main/Login';
import {Route, Routes} from 'react-router-dom';
import Main from "./pages/main/Main";
import CampgroundDetail from "./pages/main/component/CampgroundDetail";
import MyPage from "./pages/main/component/MyPage";
import EnrollCamp from "./pages/main/component/EnrollCamp";

function App() {
    return (
        <Routes>
            <Route path='/' element={<Login/>}></Route>
            <Route path='/main' element={<Main/>}></Route>
            <Route path='/myPage' element={<MyPage/>}></Route>
            <Route path='/enrollCampground' element={<EnrollCamp/>}></Route>
            <Route path='/campgroundDetail' element={<CampgroundDetail/>}></Route>
        </Routes>
    );
}

export default App;
