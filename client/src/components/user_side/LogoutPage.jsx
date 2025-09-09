import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';

const Logout = () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    const { logout} = useAuth()
    const navigate = useNavigate();
    const hidden = () => {
        logout()
        navigate('/')
    }
    // const cancel = () => navigate("/Dashboard");
    return (
    <div>
        <div className="teacher-info">
            {/* <img
        onClick={cancel}
        src="/src/assets/cross.png"
        className="h-[12px] absolute right-[15px] top-[25px] cursor-pointer"
        alt="Cancel"
        /> */}
            <div className="avatar flex flex-col justify-center items-center h-[600px]">
                <img src="/src/assets/Avatar.png" alt="avatar" className='h-[182px] w-[182px]'/>
                <span className='font-medium text-[24px]'>{user?.name}</span>
                <span className='text-gray-600 text-[16px]'>Teacher, EXTC dept.</span>
            </div>
            <div className="qr flex flex-col justify-center items-center gap-[8px]">
                <button onClick={hidden} className='flex justify-center items-center rounded-lg text-sm font-normal gap-3 bg-[#1D61E7] text-white w-[350px] h-[48px] shadow-[0px_4px_4px_0px_#00000040] '> Log Out </button>
            </div>
        </div>
    </div>
    )
}

export default Logout