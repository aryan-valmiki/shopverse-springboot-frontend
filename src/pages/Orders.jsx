import React, { useEffect, useState } from 'react';
import { getOrder } from '../features/order/order.js';
import { toast } from 'react-toastify';
import {useNavigate} from 'react-router-dom'
import {useDispatch} from 'react-redux'
import {logout} from '../redux/slices/authSlice.js'

function Orders() {
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrder();
      setOrders(response.data.data);
    } catch (error) {
      if(error.response.status == 401 && error.response.data == "No cookies") {
        dispatch(logout());
        setError("Session timed out");
        toast.error("Session timed out");
        navigate("/login");
      } else if(error.response.status !== 401){
        const msg = error?.response?.data?.message || error?.message || "Failed to load orders";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-8 text-lg text-gray-700">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return orders.length === 0 ? (
    <div className="text-center text-gray-600 py-10 text-xl">You have no orders yet.</div>
  ) : (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Orders</h2>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
              <th className="text-left px-6 py-3">Order ID</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Amount</th>
              <th className="text-left px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {orders.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-3">{item.id}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${item.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'PENDING'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3 font-medium">₹{item.totalAmount}</td>
                <td className="px-6 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
