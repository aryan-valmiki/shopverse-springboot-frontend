import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/auth';
import { logout } from '../redux/slices/authSlice';

function Navbar() {
  const user = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
      setError(error?.response?.data?.message || error.message);
    }
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center z-50 sticky top-0">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        ShopVerse
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {!user.isLoggedIn ? (
          <div className="relative group">
            <div className="text-blue-600 font-medium cursor-pointer hover:underline">Account</div>
            <div className="absolute right-0 mt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-white border rounded shadow-md flex flex-col z-50 min-w-[140px]">
              <Link to="/login" className="px-4 py-2 hover:bg-gray-100">Login</Link>
              <Link to="/register" className="px-4 py-2 hover:bg-gray-100">Register</Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {!user.user?.isAdmin ? (
              <>
                <Link to="/orders" className="text-blue-600 hover:underline">Orders</Link>
                <span className="text-gray-700">Hi, {user.user.name}</span>
              </>
            ) : (
              <>
                <Link to="/admin/createProduct" className="text-blue-600 hover:underline">Add Product</Link>
                <Link to="/admin/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
                <span className="font-semibold text-gray-700">Admin: {user.user.name}</span>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        )}

        <Link to="/cart" className="text-blue-600 font-medium hover:underline">
          Cart
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
