import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaQrcode, FaTable, FaUser, FaHome, FaSignInAlt } from 'react-icons/fa';
import useAuthStore from '../lib/authStore';

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-md transition ${isActive ? 'bg-cyan-600 text-white' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}`;

export default function Navbar() {
  const { accessToken, logout } = useAuthStore();
  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link to="/dashboard" className="text-xl font-semibold neon">
          QroCde
        </Link>
        <nav className="flex items-center gap-2">
          {accessToken ? (
            <>
              <NavLink to="/dashboard" className={linkCls}><FaHome /> Dashboard</NavLink>
              <NavLink to="/scan" className={linkCls}><FaQrcode /> Scan</NavLink>
              <NavLink to="/records" className={linkCls}><FaTable /> Records</NavLink>
              <NavLink to="/profile" className={linkCls}><FaUser /> Profile</NavLink>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <NavLink to="/login" className={linkCls}><FaSignInAlt /> Login</NavLink>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
