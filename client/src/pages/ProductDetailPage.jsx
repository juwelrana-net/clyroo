// client/src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { AlertCircle, Loader2 } from 'lucide-react';

// Dialog components ko import karein
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.jsx"; //

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isOrdering, setIsOrdering] = useState(false);

    // --- NAYA STATE POPUP KE LIYE ---
    const [isTipsOpen, setIsTipsOpen] = useState(true); // Page load par popup dikhaye

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/products/${id}`);
                setProduct(response.data);
                if (response.data.stock > 0) { setQuantity(1); } else { setQuantity(0); }
            } catch (err) {
                setError("Product details load nahi ho paye.");
            } finally {
                setLoading(false);
            }
        };
        if (id) { fetchProduct(); }
    }, [id]);

    const handleOrder = async () => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError("Error: Please enter a valid email address.");
            return;
        }
        if (quantity < 1 || quantity > product.stock) {
            setError(`Error: Invalid quantity. Max stock is ${product.stock}.`);
            return;
        }

        setIsOrdering(true);
        setError(null);

        try {
            const response = await axios.post('/api/orders/create', {
                productId: product._id,
                quantity: quantity,
                customerEmail: email,
            });
            const newOrder = response.data;

            // Naye 'customerAccessToken' ko sessionStorage mein save karein
            // Taa ki success page iska istemal kar sake
            if (newOrder.customerAccessToken) {
                sessionStorage.setItem(newOrder._id, newOrder.customerAccessToken);
            }

            // Payment selection page par bhejein
            navigate(`/order/${newOrder._id}/pay`); //

        } catch (err) {
            console.error("Order creation failed:", err.response?.data?.msg || err.message);
            setError(err.response?.data?.msg || "Order create karne mein koi error aa gaya.");
        } finally {
            setIsOrdering(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading...</div>;
    if (error && !product) return <div className="container mx-auto max-w-7xl px-4 py-8 text-destructive">{error}</div>;
    if (!product) return <div className="container mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Product not found.</div>;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">

            {/* --- NAYA "BUYING TIPS" POPUP --- */}
            <Dialog open={isTipsOpen} onOpenChange={setIsTipsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-primary text-center">Buying Tips</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground space-y-3">
                        <p>One card, one number. <b className="text-red-500">Manual-only registration</b>, safe and reliable.</p>
                        <p><b className="text-red-500">Warranty within 1 hour first landing successful</b>, be sure to test it promptly.</p>
                        <p>At present, the risk control is strict, <b className="text-red-500">no warranty will change to V</b>, mind not buy.</p>
                        <p className="font-semibold"><b className="text-red-500">No use do not recommend buying.</b></p>
                        <p className="text-xs">In case of problems, please contact after-sales service (TBD).</p>
                        <hr className="border-border" />
                        <p className="text-xs text-primary">
                            <b>Warm reminder:</b> Please read the product description carefully before purchasing. By placing an order, you agree to the above tips.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsTipsOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* --- POPUP KHATAM --- */}


            <div className="bg-secondary/30 border border-border rounded-lg shadow-xl p-8 flex flex-col md:flex-row gap-8">
                {/* Image Section */}
                <div className="md:w-1/2 flex justify-center items-center">
                    <img
                        src={product.imageUrl || `https://placehold.co/600x400/000000/FFFFFF?text=${product.name}`}
                        alt={product.name}
                        className="rounded-lg object-cover max-h-96 w-full"
                    />
                </div>
                {/* Details Section */}
                <div className="md:w-1/2">
                    <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl font-extrabold text-primary">${product.price.toFixed(2)}</span>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                            Stock: {product.stock}
                        </span>
                    </div>
                    <p className="text-muted-foreground mb-6">{product.description}</p>
                    <div className="space-y-4">
                        {error && (
                            <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3">
                                <AlertCircle size={20} />{error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Contact Email</label>
                            <input
                                type="email" id="email" value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                placeholder="Enter your email address"
                                className="w-full p-3 border border-border bg-background rounded-md focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-muted-foreground mb-1">Quantity</label>
                            <input
                                type="number" id="quantity" value={quantity} min="1" max={product.stock}
                                onChange={(e) => { setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1))); setError(null); }}
                                className="w-full p-3 border border-border bg-background rounded-md focus:ring-primary focus:border-primary"
                                disabled={product.stock === 0}
                            />
                        </div>
                        <Button
                            className="w-full py-3 text-lg"
                            onClick={handleOrder}
                            disabled={product.stock === 0 || isOrdering}
                        >
                            {isOrdering ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                            {isOrdering ? 'Creating Order...' : product.stock > 0 ? `Proceed to Pay ($${(product.price * quantity).toFixed(2)})` : 'Out of Stock'}
                        </Button>
                    </div>
                    <Button variant="link" className="w-full mt-4 text-muted-foreground" onClick={() => setIsTipsOpen(true)}>
                        Show Buying Tips
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;