import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Register from "./pages/user/Register";
import UserLogin from "./pages/user/UserLogin";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import Navbar from "./components/Navbar";
import Home from "./pages/user/Home";
import AdminProductsPage from "./pages/admin/ProductsPage";

export default function App() {
  const { user, role } = useAuthStore();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <UserLogin />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/admin/login" element={role === "admin" ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />

        {/* Protected User Routes */}
        {/* {role === "user" && (
          <>
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-products" element={<MyProducts />} />
          </>
        )}

        {/* Protected Admin Routes */}
         {role === "admin" && (
          <>
            <Route path="/admin/dashboard" element={<h1>Dashboard</h1>} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/plans" element={<h1>Plans</h1>} />
            <Route path="/admin/subscriptions" element={<h1>Subscriptions</h1>} />
            <Route path="/admin/coupons" element={<h1>Coupons</h1>} />
            <Route path="/admin/me" element={<h1>Me</h1>} />
          </>
        )}

        {/* Fallback Route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}
