import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ShoppingBag, User, Home, LayoutDashboard, Users, Package, CreditCard, Repeat, Tag, Settings } from "lucide-react";
import { FaRegUser, FaStore } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { RiAdminLine } from "react-icons/ri";

const Navbar = () => {
  const { user, role, logout, setUserFromSession } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    setUserFromSession();
    
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logoutFunction = async () => {
    const res = await logout();
    res && navigate("/login");
    setMobileOpen(false);
  };

  const nav = () => {
    role === "admin" ? navigate("/admin/dashboard") : navigate("/");
    setMobileOpen(false);
  };

  // Admin navigation items
  const adminNavItems = [
    { path: "/admin/dashboard", name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/admin/users", name: "Users", icon: <Users className="h-5 w-5" /> },
    { path: "/admin/products", name: "Products", icon: <Package className="h-5 w-5" /> },
    { path: "/admin/plans", name: "Plans", icon: <CreditCard className="h-5 w-5" /> },
    { path: "/admin/subscriptions", name: "Subscriptions", icon: <Repeat className="h-5 w-5" /> },
    { path: "/admin/coupons", name: "Coupons", icon: <Tag className="h-5 w-5" /> },
    { path: "/admin/me", name: "My Profile", icon: <CgProfile className="h-5 w-5" /> }
  ];

  // User navigation items
  const userNavItems = [
    { path: "/", name: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/my-bag", name: "My Bag", icon: <ShoppingBag className="h-5 w-5" /> },
    { path: "/profile", name: "Profile", icon: <User className="h-5 w-5" /> }
  ];

  // Guest navigation items
  const guestNavItems = [
    { path: "/", name: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/login", name: "Login", icon: <FaRegUser className="h-5 w-5" /> },
    { path: "/admin/login", name: "Admin Login", icon: <RiAdminLine className="h-5 w-5" /> }
  ];

  const currentNavItems = role === "admin" 
    ? adminNavItems 
    : user 
      ? userNavItems 
      : guestNavItems;

  return (
    <>
      {/* Desktop Navbar */}
      <nav 
        ref={navbarRef}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group"
              onClick={nav}
            >
              <FaStore className="h-6 w-6 mr-2 text-white" />
              <span className="text-white text-xl font-bold tracking-tight hidden md:block">
                {role === "admin" ? "Admin Panel" : "Digital Product Store"}
              </span>
            </div>

            {/* Desktop Navigation - Icons Only */}
            <div className="hidden md:flex items-center space-x-4">
              {currentNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-white hover:bg-indigo-700 p-3 rounded-full flex items-center transition-colors"
                  title={item.name} // Show tooltip on hover
                >
                  {item.icon || item.name.charAt(0)}
                </Link>
              ))}
              {user && (
                <button
                  onClick={logoutFunction}
                  className="text-white hover:bg-indigo-700 p-3 rounded-full transition-colors"
                  title="Logout"
                >
                  <IoIosLogOut className="h-5 w-5 mr-1" />
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-indigo-700 focus:outline-none transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - Icons + Text */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <div className="flex items-center">
            <FaStore className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">
              {role === "admin" ? "Admin Panel" : "Digital Store"}
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-white hover:text-indigo-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {currentNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center p-3 rounded hover:bg-indigo-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {!item.icon && <span className="mr-3">{item.name.charAt(0)}</span>}
              <span>{item.name}</span>
            </Link>
          ))}
          {user && (
            <button
              onClick={logoutFunction}
              className="w-full flex items-center p-3 rounded hover:bg-indigo-700 transition-colors text-left"
            >
              <IoIosLogOut className="h-5 w-5 mr-1" /> Logout
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;