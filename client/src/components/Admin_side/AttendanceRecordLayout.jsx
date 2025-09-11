import React from "react";
import { EmployeeAttendance } from "./EmployeeAttendance";

export const AttendanceRecordLayout = () => {
  return (
    <div className="my-[331px] mx-[104px] bg-wihte  h-max border-1 px-[24px] py-[16px] border-[#6C727833] rounded-[20px] flex flex-col gap-[32px]">
      <div className="flex justify-between items-center h-[86px] px-[24px] py-[16px] ">
        <div className="flex justify-center gap-[24px]">
          <h2 className="font-bold text-[24px]">Attendance record</h2>
          <div className="flex gap-[15px] items-center">
            <img className="w-[17px]" src="src/assets/calander.svg" alt="" />
            <p className="text-[14px] font-normal">05 July 2025</p>
          </div>
        </div>
        <div className="flex text-[14px] gap-[24px] h-[54px]">
          <button className="flex items-center border-1 border-[#00000033] px-[22px] py-[15px] rounded-[10px] gap-[10px]">
            <img
              className="h-[24px]"
              src="src/assets/material-symbols_sort.svg"
              alt=""
            />
            <p className="font-semibold">Sort</p>
          </button>
          <button className="bg-[#1D61E7] text-white flex items-center border-1 border-[#00000033] px-[22px] py-[15px] rounded-[10px] gap-[10px]">
            <img className="h-[24px]" src="src/assets/Filter.svg" alt="" />
            <p className="font-semibold">Advanced Filters</p>
          </button>
          <div className="w-[244px] flex items-center justify-between border-1 border-[#00000033] px-[16px] py-[15px] rounded-[10px] gap-[10px]">
            <input
              className="placeholder:font-semibold placeholder:text-[#989898] focus:outline-none"
              type="text"
              name=""
              placeholder="Search Employees"
              id=""
            />
            <img className="h-[24px]" src="src/assets/Search Icon.svg" alt="" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[16px]">
        <EmployeeAttendance />
      </div>
    </div>
  );
};
