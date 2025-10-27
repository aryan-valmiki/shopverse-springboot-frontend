import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../features/auth/auth.js';
import { Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (name.trim().length === 0) return setError('Name is required');
      if (email.trim().length === 0) return setError('Email is required');
      if (password.trim().length === 0) return setError('Password is required');
      if (password !== confirmPassword) return setError('Passwords do not match');

      setLoading(true);
      setError(null);

      const response = await registerUser({ email, password, name });
      console.log(response);

      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      navigate('/login');
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
      setError(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 border p-8 rounded-lg shadow-sm bg-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
            placeholder="Enter password"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-semibold p-3 rounded hover:bg-yellow-400 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Login here
        </Link>
      </div>
    </div>
  );
}

export default Register;
