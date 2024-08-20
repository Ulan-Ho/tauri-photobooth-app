import { NavLink } from "react-router-dom";
import Layout1 from "../components/Layout1.jsx";
import '../App.css';
import main_icon from '../assets/main_icon.png';

export default function MainPage() {


    return (
        <Layout1>
            <div className="flex flex-col">
                <NavLink to='/template'><img src={main_icon} alt="camera icon" /></NavLink>
                <div style={word}>НАЧАТЬ ФОТОСЕССИЮ </div>
            </div>
        </Layout1>
    )
}

const link = {
    position: 'absolute',
    top: '330px',
    left: '30%',
    width: '400px',
    // height: '340px',
    borderRadius: '15px',
    backgroundSize: 'cover',
}

const word = {
    position: 'absolute',
    top: '70%',
    left: '35%',
    color: 'white',
    textAlign: 'center',
    fontSize: '50px',
    lineHeight: '1.3',
    width: '400px',
    height: '200px',
}