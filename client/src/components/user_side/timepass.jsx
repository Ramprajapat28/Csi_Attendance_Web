import React from 'react'

const timepass = () => {
    return (
    <div>
        <div className="w-full h-screen flex justify-center relative overflow-hidden">
        <AnimatePresence>
          {step === "logoAndText" && (
          <div className="w-full h-full relative flex flex-col items-center">
            <motion.div
            className="h-[98px] w-[95px] absolute p-[15px]"
            initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 2 }}
            animate={{ top: "80px", left: "50%", x: "-50%", y: "0%", scale:1.4 }}
            transition={{ duration: 1.5 }}
            >
              <img src="/Checkmark.png" alt="" />
              <div className='font-semibold text-[16px] w-[350px] absolute left-[-25px] top-[88px]'>Attendance Marked</div>
            </motion.div>
            <motion.div
            className="markedD flex flex-col items-center pt-[180px]" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            >
            <div className="marked flex flex-col justify-center items-center h-[100px] w-[350px] gap-[10px]">
              <div className="text flex flex-col justify-center items-center">
              <span className='text-gray-400'>Your entry has been marked</span>
            </div>
          </div>

      <div className="detail h-[450px] w-[350px] flex flex-col gap-[15px]">
        <span className='font-semibold'>Details:</span>
        <div className="info flex flex-col justify-center items-center h-[auto] border-slate-300 border-[1px] rounded-2xl">
          <div className="info1 h-[64px] w-[310px] flex flex-col gap-[12px]">
            <span className='text-sm font-semibold '>Name</span>
            <span className='text-xs text-gray-500'>John Smith</span>
          </div>
          <div className="info1 h-[64px] w-[310px] flex flex-col gap-[12px]">
            <span className='text-sm font-semibold '>Employee ID</span>
            <span className='text-xs text-gray-500'>EMP0234</span>
          </div>
          <div className="info1 h-[64px] w-[310px] flex flex-col gap-[12px]">
            <span className='text-sm font-semibold '>Department</span>
            <span className='text-xs text-gray-500'>EXTC</span>
          </div>
          <div className="info1 h-[64px] w-[310px] flex flex-col gap-[12px]">
            <span className='text-sm font-semibold '>Date</span>
            <span className='text-xs text-gray-500'>05/07/2025</span>
          </div>
          <div className="info1 h-[64px] w-[310px] flex justify-between">
            <div className="checkIn flex flex-col gap-[12px]">
              <span className='text-sm font-semibold '>Check-in time</span>
              <span className='text-xs text-gray-500'>08:45</span>
            </div>
            <div className="checkOut flex flex-col gap-[12px]">
              <span className='text-sm font-semibold '>Check-out time</span>
              <span className='text-xs text-gray-500'>--</span>
            </div>
          </div>
        </div>
        <button className='flex justify-center items-center mt-[20px] rounded-lg text-sm gap-3 bg-[#1D61E7] text-white w-[350px] h-[48px] shadow-xl/15'>
          Go to Dashboard
        </button>
      </div>
      </motion.div>
      </div>
      )}

      </AnimatePresence>
    </div>
    </div>
    )
}

export default timepass
