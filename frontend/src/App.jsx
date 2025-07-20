import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Register from "./pages/user/Register";
import UserLogin from "./pages/user/UserLogin";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import Navbar from "./components/Navbar";
import Home from "./pages/user/Home";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminProfile from "./pages/admin/AdminProfile";
import ProductDetail from "./pages/user/ProductDetail";
import Payment from "./pages/user/Payment";
import MyBag from "./pages/user/MyBag";

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
         {role === "user" && (
          <>
            <Route path="/cart" element={<h1>Cart</h1> } />
            <Route path="/profile" element={<h1>Profile</h1>}/>
            <Route path="/my-bag" element={ <MyBag/> } />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/payment" element={<Payment />} />

          </>
        )}

        {/* Protected Admin Routes */}
         {role === "admin" && (
          <>
            <Route path="/admin/dashboard" element={<h1>Dashboard</h1>} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/plans" element={<AdminPlansPage/>} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage/>} />
            <Route path="/admin/coupons" element={<AdminCoupons/>} />
            <Route path="/admin/me" element={<AdminProfile/>} />
          </>
        )}

        {/* Fallback Route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}
