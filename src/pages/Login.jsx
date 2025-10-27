import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/auth.js';
import { login, logout } from '../redux/slices/authSlice.js';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (email.trim().length === 0) return setError('Email is required');
      if (password.trim().length === 0) return setError('Password is required');

      setLoading(true);
      setError(null);

      const response = await loginUser({ email, password });
      dispatch(login(response.data));
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
      setError(error?.response?.data?.message || error.message);
      dispatch(logout());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 border p-8 rounded-lg shadow-sm bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-semibold p-3 rounded hover:bg-yellow-400 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default Login;
