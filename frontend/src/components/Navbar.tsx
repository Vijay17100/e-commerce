import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/products" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                    <ShoppingCart size={28} />
                    E-Shop
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                        Products
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/orders" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                                <Package size={18} />
                                My Orders
                            </Link>
                            <div className="flex items-center gap-4 ml-4 border-l pl-4">
                                <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                    <User size={16} />
                                    {user?.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 ml-4 border-l pl-4">
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                                Login
                            </Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
