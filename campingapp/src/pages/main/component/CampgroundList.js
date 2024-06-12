import './css/CampgroundList.css'
import {useNavigate} from "react-router-dom";

export default function CampgroundList({list}) {
    const navigator = useNavigate()
    const handleClick = (item) => (e) => {
        e.preventDefault()
        console.log(item)
        navigator(`/main/campingDetail/${item.campground_id}`, {state: {item: item}})
    };

    return (
        <div>
            {list.map((item, index) => (
                <div key={index} className="campground"
                     onClick={handleClick(item)}>
                    <img src={item.main_photo} alt={item.name}/>
                    <div>
                        <h2>{item.name}</h2>
                        <h3>{item.address}</h3>
                        <p>{item.contact}</p>
                        <p>{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}