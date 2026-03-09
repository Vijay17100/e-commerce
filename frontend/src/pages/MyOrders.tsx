import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Clock, DollarSign, Loader2 } from 'lucide-react';

interface Order {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    order_date: string;
    amount: number;
}

const MyOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (err) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-600 p-8">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-3 rounded-full">
                    <Package className="text-indigo-600" size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">View and track your previous purchases</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <Package className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
                    <p className="text-gray-500">You haven't placed any orders. Start exploring our products!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:-translate-y-1 duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg hidden sm:block">
                                    <Package className="text-gray-400" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{order.product_name}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="font-medium text-gray-700">Order ID:</span> #{order.id}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(order.order_date).toLocaleDateString()}
                                        </span>
                                        <span>Qty: {order.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right sm:text-left flex items-center sm:block border-t sm:border-0 pt-4 sm:pt-0">
                                <span className="text-sm text-gray-500 block sm:mb-1 w-full text-left sm:text-right">Total Amount</span>
                                <span className="text-xl font-black text-indigo-600 flex items-center justify-end">
                                    ${order.amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
