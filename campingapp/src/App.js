import './App.css';
import Login from './pages/main/Login';
import {Route, Routes} from 'react-router-dom';
import Main from "./pages/main/Main";
import CampgroundDetail from "./pages/main/component/CampgroundDetail";
import MyPage from "./pages/main/component/MyPage";
import EnrollCamp from "./pages/main/component/EnrollCamp";
import CampingDetail from "./pages/detail/CampingDetail"

function App() {
    return (
        <Routes>
            <Route path='/' element={<Login/>}></Route>
            <Route path='/main' element={<Main/>}></Route>
            <Route path='/myPage' element={<MyPage/>}></Route>
            <Route path='/campgroundDetail' element={<CampgroundDetail/>}></Route>

            {/*위에서 아래로*/}
            <Route path="/main/campingDetail/:campgroundId" element={<CampingDetail/>}></Route>
        </Routes>
    );
}

export default App;