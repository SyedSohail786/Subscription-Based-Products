import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Navbar = () => {
  const { user, role, logout } = useAuthStore();

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
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
            <button onClick={logout}>Logout</button>
          </>
        ) : user ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/my-products">My Products</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
