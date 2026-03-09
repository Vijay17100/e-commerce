import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderLoading, setOrderLoading] = useState<number | null>(null);
    const [orderSuccess, setOrderSuccess] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();

    // CRUD state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '' });
    const [crudLoading, setCrudLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ name: product.name, description: product.description, price: product.price.toString() });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) return;
        setCrudLoading(true);
        try {
            const payload = { ...formData, price: parseFloat(formData.price) };
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, payload);
            } else {
                await api.post('/products', payload);
            }
            await fetchProducts();
            handleCloseModal();
        } catch (err) {
            alert('Failed to save product');
        } finally {
            setCrudLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAuthenticated || !confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            await fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleOrder = async (productId: number) => {
        if (!isAuthenticated) return;

        setOrderLoading(productId);
        setOrderSuccess(null);

        try {
            await api.post('/orders', { product_id: productId, quantity: 1 });
            setOrderSuccess(productId);
            setTimeout(() => setOrderSuccess(null), 3000);
        } catch (err) {
            alert('Failed to place order');
        } finally {
            setOrderLoading(null);
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
        <div>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Our Products</h1>
                    <p className="text-gray-600">Discover our collection of premium items.</p>
                </div>
                {isAuthenticated && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} /> Add Product
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col relative group">
                        {isAuthenticated && (
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                                <button onClick={() => handleOpenModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Product">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Product">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                        <div className="h-48 bg-gray-100 flex items-center justify-center p-6">
                            <ShoppingBag size={64} className="text-gray-300" />
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{product.name}</h3>
                                    <span className="text-lg font-black text-indigo-600 ml-4">${product.price.toFixed(2)}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{product.description}</p>
                            </div>

                            <button
                                onClick={() => handleOrder(product.id)}
                                disabled={!isAuthenticated || orderLoading === product.id}
                                className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2
                  ${!isAuthenticated
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : orderSuccess === product.id
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {orderLoading === product.id ? <Loader2 className="animate-spin" size={20} /> :
                                    orderSuccess === product.id ? 'Ordered!' :
                                        !isAuthenticated ? 'Login to Order' : 'Buy Now'}
                            </button>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No products available at the moment.
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                    type="number" step="0.01" min="0" required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit" disabled={crudLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mt-4"
                            >
                                {crudLoading ? 'Saving...' : 'Save Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
