import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ShoppingBag, User, Home, LayoutDashboard, Users, Package, CreditCard, Repeat, Tag, Settings } from "lucide-react";
import { FaRegUser, FaStore } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { RiAdminLine } from "react-icons/ri";
import { BiLibrary } from "react-icons/bi";

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
    { path: "/my-orders", name: "My Orders", icon: <BiLibrary className="h-5 w-5" /> },
    { path: "/profile", name: "Profile", icon: <User className="h-5 w-5" /> },
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
        className="backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group"
              onClick={nav}
            >
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <FaStore className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 hidden sm:block">
                <span className="text-gray-900 text-xl font-bold tracking-tight">
                  {role === "admin" ? "Admin Panel" : "Digital Store"}
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  {role === "admin" ? "Management System" : "Books & Audio"}
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {currentNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="nav-item group relative p-3 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                  title={item.name}
                >
                  <div className="relative">
                    {item.icon}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  </div>
                </Link>
              ))}
              {user && (
                <button
                  onClick={logoutFunction}
                  className="nav-item group relative p-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200"
                  title="Logout"
                >
                  <div className="relative">
                    <IoIosLogOut className="h-5 w-5" />
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      Logout
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 focus:outline-none transition-all duration-200"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 backdrop-blur-md bg-white/95 border-r border-gray-200/50 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
              <FaStore className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-gray-900 text-lg font-bold">
                {role === "admin" ? "Admin Panel" : "Digital Store"}
              </span>
              <div className="text-xs text-gray-500 font-medium">
                {role === "admin" ? "Management System" : "Books & Audio"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          {currentNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center p-4 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="p-2 rounded-lg bg-gray-100/50 group-hover:bg-indigo-100/50 transition-colors mr-4">
                {item.icon}
              </div>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
          {user && (
            <button
              onClick={logoutFunction}
              className="w-full flex items-center p-4 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-gray-100/50 group-hover:bg-red-100/50 transition-colors mr-4">
                <IoIosLogOut className="h-5 w-5" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
