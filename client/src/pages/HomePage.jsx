// client/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard.jsx';
import { AlertCircle } from 'lucide-react';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get('/api/products');
                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Products load nahi ho paye. Server check karein.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* --- ANNOUNCEMENT BOX UPDATE KIYA GAYA --- */}
            <div className="bg-secondary/30 border border-border rounded-lg p-6 mb-10">
                <h2 className="text-2xl font-bold text-primary mb-3">Announcement</h2>
                <div className="space-y-2 text-muted-foreground">
                    <p className="text-lg font-semibold">Purchase Instructions:</p>
                    <ul className="list-decimal list-inside pl-4 text-sm">
                        <li>Please read the product description carefully before purchasing, there is no refund policy for non-product quality issues!</li>
                        <li>All products in our store are only for development and testing use, and are prohibited from being used for illegal and criminal activities.</li>
                        <li>The product warranty is only applicable in case of common use, the warranty method is to replace the new product or refund, no other loss will be compensated!</li>
                        <li>Default warranty rules: 1 hour for first boosting power-on. After 1 hour, there is no warranty!</li>
                    </ul>
                    <p className="text-lg font-semibold mt-4">Tip:</p>
                    <ul className="list-decimal list-inside pl-4 text-sm">
                        <li>Cloud accounts are unstable, please bear the risk yourself.</li>
                        <li>All accounts in our store are manually registered.</li>
                    </ul>
                    <p className="text-red-500 text-sm font-semibold mt-4">
                        Click Contact Customer Service (TBD)
                    </p>
                </div>
            </div>
            {/* --- ANNOUNCEMENT BOX END --- */}


            {/* Product Grid */}
            <div>
                <h3 className="text-3xl font-bold mb-6 text-foreground">
                    What's a little needed today?
                </h3>

                {loading && <p className="text-muted-foreground">Loading products...</p>}

                {error && (
                    <div className="text-destructive-foreground bg-destructive/80 p-4 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="text-muted-foreground bg-secondary/50 p-6 rounded-lg border border-border">
                        No products found. Please add products from the admin panel.
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;