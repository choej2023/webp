import './App.css';
import Login from './pages/main/Login';
import {Route, Routes} from 'react-router-dom';
import Main from "./pages/main/Main";
import MyPage from "./pages/main/component/MyPage";
import CampingDetail from "./pages/detail/CampingDetail"
import EnrollCamp from "./pages/enroll/EnrollCamp";
import ModifyCamp from "./pages/enroll/ModifyCamp";

function App() {
    return (
        <Routes>
            <Route path='/' element={<Login/>}></Route>
            <Route path='/main' element={<Main/>}></Route>
            <Route path='/myPage' element={<MyPage/>}></Route>
            <Route path='/EnrollCamp' element={<EnrollCamp/>}></Route>
            <Route path='/modifyCamp' element={<ModifyCamp/>}></Route>

            {/*위에서 아래로*/}
            <Route path="/main/campingDetail/:campgroundId" element={<CampingDetail/>}></Route>
        </Routes>
    );
}

export default App;