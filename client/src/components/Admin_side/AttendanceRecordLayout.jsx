import React from "react";
import { useEffect, useState } from "react";
import { EmployeeAttendance } from "./EmployeeAttendance";

export const AttendanceRecordLayout = () => {
  const [selectedDate, setSelectedDate] = useState("Pick a date");

  useEffect(() => {
    const calendar = document.querySelector("calendar-date");
    const popover = document.getElementById("cally-popover1");

    if (calendar) {
      const handler = (e) => {
        if (e.target.value) {
          // ✅ format date
          const formatted = new Date(e.target.value).toLocaleDateString(
            "en-GB", // change to "en-US" if you want mm/dd/yyyy
            { day: "2-digit", month: "short", year: "numeric" }
          );
          setSelectedDate(formatted);

          // ✅ close popover automatically
          if (popover?.hidePopover) {
            popover.hidePopover();
          }
        }
      };
      calendar.addEventListener("change", handler);
      return () => calendar.removeEventListener("change", handler);
    }
  }, []);

  return (
    <div className="my-[331px] mx-[104px] bg-wihte  h-max border-1 px-[24px] py-[16px] border-[#6C727833] rounded-[20px] flex flex-col gap-[32px]">
      <div className="flex justify-between items-center h-[86px] px-[24px] py-[16px] ">
        <div className="flex justify-center gap-[24px]">
          <h2 className="font-bold text-[24px]">Attendance record</h2>
          <div className="flex gap-[15px] items-center">
            {/* <p className="text-[14px] font-normal">05 July 2025</p> */}
            <div>
              <button
                popoverTarget="cally-popover1"
                className="input input-bordered border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-0 text-[14px] font-normal shadow-none cursor-pointer"
                id="cally1"
                style={{ anchorName: "--cally1" }}>
                <img
                  className="w-[17px]"
                  src="src/assets/calander.svg"
                  alt=""
                />
                {selectedDate}
              </button>

              <div
                popover="true"
                id="cally-popover1"
                className="dropdown bg-base-100 rounded-box shadow-lg"
                style={{ positionAnchor: "--cally1" }}>
                <calendar-date class="cally">
                  <svg
                    aria-label="Previous"
                    className="fill-current size-4"
                    slot="previous"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                  </svg>
                  <svg
                    aria-label="Next"
                    className="fill-current size-4"
                    slot="next"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                  </svg>
                  <calendar-month></calendar-month>
                </calendar-date>
              </div>
            </div>
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
