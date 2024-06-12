import {useLocation} from "react-router-dom";

export default function CampgroundDetail () {
    const location =  useLocation()
    const item = location.state.item
    return (
        <div></div>
    )
}