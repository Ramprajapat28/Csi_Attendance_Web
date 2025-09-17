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
    const cancel = () => navigate("/Dashboard");
    return (
    <div>
        <div className='space1 flex justify-center items-center h-screen w-screen bg-gray-500'>
        <div className="teacher-info h-[613px] w-[353px] bg-white flex flex-col justify-center items-center rounded-3xl">
            <img
        onClick={cancel}
        src="/cross.png"
        className="h-[12px] cursor-pointer relative left-[150px]"
        alt="Cancel"
        />
            <div className="avatar flex flex-col justify-center items-center h-[210px] w-[156px] m-[150px]">
                <img src="/Avatar.png" alt="avatar" className='h-[182px] w-[182px]'/>
                <span className='font-medium text-[24px]'>{user?.name}</span>
                <span className='text-gray-600 text-[16px]'>Teacher, EXTC dept.</span>
            </div>
            <div className="qr flex flex-col justify-center items-center gap-[8px]">
                <button onClick={hidden} className='flex justify-center items-center rounded-lg text-sm font-normal gap-3 bg-[#1D61E7] text-white w-[300px] h-[48px] shadow-[0px_4px_4px_0px_#00000040] '> Log Out </button>
            </div>
        </div>
        </div>
    </div>
    )
}
// absolute right-[15px] top-[25px]
export default Logout