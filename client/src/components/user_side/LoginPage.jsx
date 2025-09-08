import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, baseurl } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${baseurl}/auth2/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.accessToken) {
        login(res.data.user, res.data.accessToken);
        toast.success("Login successful!");
        navigate("/Teacherinfo");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login error");
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    navigate("/Teacherinfo");
  };

  return (
    <div className="flex flex-col w-full h-[100dvh]">
      <ToastContainer />
      <div className="navbar w-screen h-[110px] flex justify-center items-end p-[16px] ">
        <img src="/src/assets/logo.svg" alt="atharva logo" />
      </div>

      <div className="relative h-[100%] w-full px-[22px] py-[28px] inset-0 flex flex-col text-center justify-between">
        <h1 className="text-[32px] font-bold tracking-tighter">
          Sign in to your Account
          <p className="text-[16px] text-[#404142] font-semibold tracking-normal">
            Staff Login
          </p>
        </h1>

        <img className="h-[304px]" src="src/assets/login.svg" alt="" />

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded border"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded border"
          />
          <div className="w-full flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white w-full py-3 rounded font-semibold h-[48px] shadow-[0px_4px_4px_0px_#00000040] active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-100"
            >
              Login
            </button>

            <button
              onClick={handleGoogleLogin}
              className="flex justify-center items-center gap-[10px] border border-[#EFF0F6] rounded-[10px] w-max p-[22px] h-[48px] shadow-[0px_4px_4px_0px_#00000040] active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-100"
            >
              <img
                className="h-[18px] w-[24px] my-[2px]"
                src="src/assets/google.png"
                alt="google"
              />
              {/* <p className="text-[14px] text-[#1A1C1E] font-semibold">
            Continue with Google
            </p> */}
            </button>
          </div>
        </form>

        {/* <h3 className="text-[#6C7278] text-[12px] mt-4">
          Don’t have an account?{" "}
          <a className="text-[#4D81E7]" href="/register">
          Sign Up
          </a>
        </h3> */}
      </div>
    </div>
  );
};
export default LoginPage;
