import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect } from "react";

const Navbar = () => {
  const { user, role, logout, setUserFromSession } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    setUserFromSession()
  }, [])

  const logoutFunction = async () => {
    const res = await logout()
    res && navigate('/login')
  }

  const nav =()=>{
    role === "admin" ? navigate("/admin/dashboard"): navigate("/")
  }
  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold" onClick={nav}>
        {role === "admin" ? "Digital Store Admin" : "Digital Product Store"}
      </div>
      <div className="flex gap-4 items-center">
        {role === "admin" ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/plans">Plans</Link>
            <Link to="/admin/subscriptions">Subscriptions</Link>
            <Link to="/admin/coupons">Coupons</Link>
            <Link to="/admin/me">Me</Link>
            <button onClick={logoutFunction}>Logout</button>
          </>
        ) : user ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/my-bag">My Bag</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logoutFunction}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/admin/login">Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
