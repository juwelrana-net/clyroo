// client/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import ProductCard from '@/components/ProductCard.jsx';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
// import { cn } from '@/lib/utils.js';
// import { Input } from '@/components/ui/input.jsx';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    // `null` ka matlab "All" hoga
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Effect 1: Sirf ek baar categories fetch karein
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await api.get('/api/categories');
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                // Yahaan error dikhana zaroori nahi
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Effect 2: Products fetch karein (jab bhi `selectedCategory` badle)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // API call mein params bhejein
                const response = await api.get('/api/products', {
                    params: {
                        categoryId: selectedCategory, // Agar `null` hai, toh backend handle kar lega
                        search: searchTerm,
                    },
                });

                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Products load nahi ho paye. Server check karein.");
            } finally {
                setLoading(false);
            }
        };

        // --- DEBOUNCING (Future-proof) ---
        // Hum search ke liye 'debounce' add karenge taaki har key press par API call na ho.
        // Yeh user ke type karna band karne ke 500ms baad hi search karega.
        const timerId = setTimeout(() => {
            fetchProducts();
        }, 500); // 500ms delay

        // Cleanup function taaki puraane timers clear ho jaayein
        return () => {
            clearTimeout(timerId);
        };

    }, [selectedCategory, searchTerm]); // Yeh effect `selectedCategory` par depend karta hai

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            {/* --- ANNOUNCEMENT BOX UPDATE KIYA GAYA --- */}
            <div className="bg-secondary/30 border border-border rounded-lg p-6 mb-10 hidden">
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

            <div className="mb-8 relative">
                {/* Search icon ko input field ke andar rakha hai */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search products by name..."
                    className="pl-10 h-12 text-base" // Left padding di taaki text icon ke upar na aaye
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // State update karein
                />
            </div>

            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                    Categories
                </h3>
                {loadingCategories ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {/* "All" button */}
                        <Button
                            variant={selectedCategory === null ? "default" : "outline"}
                            onClick={() => setSelectedCategory(null)}
                            className="rounded-full"
                        >
                            All
                        </Button>
                        {/* Dynamic category buttons */}
                        {categories.map((cat) => (
                            <Button
                                key={cat._id}
                                variant={selectedCategory === cat._id ? "default" : "outline"}
                                onClick={() => setSelectedCategory(cat._id)}
                                className="rounded-full"
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Grid */}
            <div>
                <h3 className="text-3xl font-bold mb-6 text-foreground">
                    {loadingCategories ? "Products" :
                        categories.find(c => c._id === selectedCategory)?.name || "All Products"}
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
                        No products found {selectedCategory ? "in this category" : ""}.
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