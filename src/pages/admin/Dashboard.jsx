import React, { useEffect, useState } from 'react';
import { getAllOrder } from '../../features/admin/admin.js';
import { toast } from "react-toastify";

function Dashboard() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrder();
      console.log(response.data.data);
      setAllOrders(response.data.data);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrder();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  if (allOrders.length === 0) return <div className="text-center text-gray-600 py-8 text-xl">No orders to display</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">All Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Client ID</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {allOrders.map(order =>
              
                <tr key={`${order.id}`} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{order.userName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{order.userId}</td>
                  <td className="px-4 py-2">{order.totalQuantity}</td>  
                  <td className="px-4 py-2">₹{order.totalAmount}</td>
                  <td className="px-4 py-2">{order.createdAt}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
