import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ChevronDown, ChevronUp, ShoppingBag, User, Home } from "lucide-react";
import { FaStore } from "react-icons/fa6";

const Navbar = () => {
  const { user, role, logout, setUserFromSession } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    setUserFromSession();
    
    // Add click outside listener
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsOpen(false);
        setAdminDropdownOpen(false);
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
    setIsOpen(false);
    setAdminDropdownOpen(false);
  };

  const nav = () => {
    role === "admin" ? navigate("/admin/dashboard") : navigate("/");
    setIsOpen(false);
    setAdminDropdownOpen(false);
  };

  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
  };

  return (
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
            <FaStore className="h-6 w-6 mr-1 text-white" />
            <span className="text-white text-xl font-bold tracking-tight group-hover:scale-105 transition-transform">
              {role === "admin" ? "Digital Store Admin" : "Digital Product Store"}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {role === "admin" ? (
                <>
                  <div className="relative">
                    <button
                      onClick={toggleAdminDropdown}
                      className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                    >
                      Admin Menu
                      {adminDropdownOpen ? (
                        <ChevronUp className="ml-1 h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4 transition-transform" />
                      )}
                    </button>
                    {adminDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white py-1 animate-fadeIn">
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">📊</span> Dashboard
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">👥</span> Users
                        </Link>
                        <Link
                          to="/admin/products"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">🛍️</span> Products
                        </Link>
                        <Link
                          to="/admin/plans"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">📋</span> Plans
                        </Link>
                        <Link
                          to="/admin/subscriptions"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">🔄</span> Subscriptions
                        </Link>
                        <Link
                          to="/admin/coupons"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">🎟️</span> Coupons
                        </Link>
                        <Link
                          to="/admin/me"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <span className="mr-2">👤</span> My Profile
                        </Link>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={logoutFunction}
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : user ? (
                <>
                  <Link
                    to="/"
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <Home className="h-4 w-4 mr-1" /> Home
                  </Link>
                  <Link
                    to="/my-bag"
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" /> My Bag
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <User className="h-4 w-4 mr-1" /> Profile
                  </Link>
                  <button
                    onClick={logoutFunction}
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <Home className="h-4 w-4 mr-1" /> Home
                  </Link>
                  <Link
                    to="/login"
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/admin/login"
                    className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-indigo-700 focus:outline-none transition-colors"
              aria-label="Main menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden bg-indigo-700 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {role === "admin" ? (
            <>
              <Link
                to="/admin/dashboard"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">📊</span> Dashboard
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">👥</span> Users
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">🛍️</span> Products
              </Link>
              <Link
                to="/admin/plans"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">📋</span> Plans
              </Link>
              <Link
                to="/admin/subscriptions"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">🔄</span> Subscriptions
              </Link>
              <Link
                to="/admin/coupons"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">🎟️</span> Coupons
              </Link>
              <Link
                to="/admin/me"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">👤</span> My Profile
              </Link>
              <button
                onClick={logoutFunction}
                className="w-full text-left flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
              >
                <span className="mr-2">🚪</span> Logout
              </button>
            </>
          ) : user ? (
            <>
              <Link
                to="/"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5 mr-2" /> Home
              </Link>
              <Link
                to="/my-bag"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="h-5 w-5 mr-2" /> My Bag
              </Link>
              <Link
                to="/profile"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5 mr-2" /> Profile
              </Link>
              <button
                onClick={logoutFunction}
                className="w-full text-left flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
              >
                <span className="mr-2">🚪</span> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5 mr-2" /> Home
              </Link>
              <Link
                to="/login"
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/admin/login"
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;