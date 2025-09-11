import React from "react";
import { Search } from "lucide-react";

export const Admin_Navbar = () => {
  return (
    <div>
       <div className="navbar bg-base-200 shadow-sm flex justify-around px-[104px] py-[24px]">
        <a className="btn btn-ghost text-xl w-[231px] h-[44px]">
          <img src="/src/assets/logo.svg" alt="" />
        </a>
        <input
          type="text"
          placeholder="Search   🔍︎"
          className="input w-24 md:w-[60%] placeholder:text-center placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent"
        />
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost ">
            <div className="flex gap-[5px]">
              <img
                className=" w-6 "
                alt="Tailwind CSS Navbar component"
                src="/src/assets/Profile.svg"
              />
              <p className="text-[#1D61E7]">My Account</p>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
          {/* </div> */}
        </div>
      </div>

      <div className="bg-white navbar-center hidden lg:flex justify-center border border-t-[1px] border-b-[1px] border-l-0 border-r-0 border-gray-300 w-full h-[72px]">
        <ul className="menu menu-horizontal px-1 gap-[64px]">
          {/* Home */}
          <li>
            <input
              type="radio"
              name="nav-menu"
              id="nav-home"
              className="hidden peer"
              defaultChecked
            />
            <label
              htmlFor="nav-home"
              className="peer-checked:bg-primary peer-checked:text-black rounded-[10px] p-[15px] gap-[5px] text-[16px] font-normal flex items-center cursor-pointer transition">
              <img src="/src/assets/Home.svg" alt="home" />
              Home
            </label>
          </li>

          {/* Employees */}
          <li>
            <input
              type="radio"
              name="nav-menu"
              id="nav-employees"
              className="hidden peer"
            />
            <label
              htmlFor="nav-employees"
              className="peer-checked:bg-primary peer-checked:text-black rounded-[10px] p-[15px] gap-[5px] text-[16px] font-normal flex items-center cursor-pointer transition">
              <img src="/src/assets/Employees.svg" alt="employees" />
              Employees
            </label>
          </li>

          {/* Records */}
          <li>
            <input
              type="radio"
              name="nav-menu"
              id="nav-records"
              className="hidden peer"
            />
            <label
              htmlFor="nav-records"
              className="peer-checked:bg-primary peer-checked:text-black rounded-[10px] p-[15px] gap-[5px] text-[16px] font-normal flex items-center cursor-pointer transition">
              <img src="/src/assets/Record.svg" alt="records" />
              Records
            </label>
          </li>

          {/* Reports */}
          <li>
            <input
              type="radio"
              name="nav-menu"
              id="nav-reports"
              className="hidden peer"
            />
            <label
              htmlFor="nav-reports"
              className="peer-checked:bg-primary peer-checked:text-black rounded-[10px] p-[15px] gap-[5px] text-[16px] font-normal flex items-center cursor-pointer transition">
              <img src="/src/assets/Report.svg" alt="reports" />
              Reports
            </label>
          </li>

          {/* QR */}
          <li>
            <input
              type="radio"
              name="nav-menu"
              id="nav-qr"
              className="hidden peer"
            />
            <label
              htmlFor="nav-qr"
              className="peer-checked:bg-primary peer-checked:text-black rounded-[10px] p-[15px] gap-[5px] text-[16px] font-normal flex items-center cursor-pointer transition">
              <img src="/src/assets/QR.svg" alt="qr" />
              QR
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
};
