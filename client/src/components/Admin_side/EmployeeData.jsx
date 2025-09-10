import React from "react";

export const EmployeeData = () => {
  return (
    <div className="border-[0.5px] border-[#00000033] rounded-[10px] flex justify-between p-[24px] gap-[10px] text-[14px] text-[#6C7278] font-normal">
      <div className="flex gap-[16px] items-center">
        <input type="checkbox" name="" id="" />
        <img className="h-[24px]" src="/src/assets/Avatar.png" alt="" />
        <p className="text-[16px] font-medium text-black">John Smith</p>
      </div>
      <div className="flex justify-between w-[60%]">
        <p>jonsmith@mail.com</p>
        <p>EXTC</p>
        <p>professor</p>
        <p>2m ago</p>
      </div>
      <img src="/src/assets/3dots.svg" alt="" />
    </div>
  );
};
