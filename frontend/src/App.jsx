import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";


export default function App() {
  const { user, admin } = useAuthStore();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <UserLogin />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/admin/login" element={admin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />

        {/* Protected User Routes */}
        {/* {user && (
          <>
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-products" element={<MyProducts />} />
          </>
        )}

        {/* Protected Admin Routes */}
        {/* {admin && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/plans" element={<Plans />} />
            <Route path="/admin/subscriptions" element={<Subscriptions />} />
            <Route path="/admin/coupons" element={<Coupons />} />
            <Route path="/admin/me" element={<Me />} />
          </>
        )}

        {/* Fallback Route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}
