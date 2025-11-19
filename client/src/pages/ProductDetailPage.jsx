// client/src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, Minus, Plus } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.jsx";

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isOrdering, setIsOrdering] = useState(false);
    const [isTipsOpen, setIsTipsOpen] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/products/${id}`);
                setProduct(response.data);
                if (response.data.stock > 0) { setQuantity(1); } else { setQuantity(0); }
            } catch (err) {
                toast.error("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        if (id) { fetchProduct(); }
    }, [id]);

    const handleDecrement = () => {
        setQuantity(prevQty => Math.max(1, prevQty - 1));
    };

    const handleIncrement = () => {
        setQuantity(prevQty => Math.min(product.stock, prevQty + 1));
    };

    const handleOrder = async () => {
        // Validation with Toast
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (quantity < 1 || quantity > product.stock) {
            toast.error(`Invalid quantity. Max stock is ${product.stock}.`);
            return;
        }

        setIsOrdering(true);

        try {
            const response = await axios.post('/api/orders/create', {
                productId: product._id,
                quantity: quantity,
                customerEmail: email,
            });
            const newOrder = response.data;

            if (newOrder.customerAccessToken) {
                sessionStorage.setItem(newOrder._id, newOrder.customerAccessToken);
            }

            // Navigation se pehle toast zaroori nahi kyunki page change ho raha hai
            navigate(`/order/${newOrder._id}/pay`);

        } catch (err) {
            console.error("Order creation failed:", err.response?.data?.msg || err.message);
            toast.error(err.response?.data?.msg || "Failed to create order. Please try again.");
        } finally {
            setIsOrdering(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading...</div>;
    if (!product) return <div className="container mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Product not found.</div>;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">

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
                        <p className="text-xs">In case of problems, please contact customer service.</p>
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

            <div className="bg-secondary/30 border border-border/50 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col gap-6 md:gap-10">

                <div className="w-full flex justify-center items-center h-48 md:h-64 bg-muted/50 rounded-2xl p-4">
                    <img
                        src={product.imageUrl || `https://placehold.co/600x400/000000/FFFFFF?text=${product.name}`}
                        alt={product.name}
                        className="rounded-lg object-contain max-h-full w-full"
                    />
                </div>

                <div className="w-full flex flex-col items-center">

                    <h1 className="text-4xl font-bold text-foreground text-center mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-5xl font-extrabold text-primary">${product.price.toFixed(2)}</span>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                            Stock: {product.stock}
                        </span>
                    </div>

                    <p className="text-muted-foreground mb-8 text-center max-w-md">
                        {product.description}
                    </p>

                    <div className="space-y-4 w-full max-w-md">
                        {/* Error Div Removed (Ab Toast hai) */}

                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Contact Email</Label>
                            <Input
                                type="email" id="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full p-3 border border-border bg-background rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity" className="block text-sm font-medium text-muted-foreground mb-1">Quantity</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 flex-shrink-0"
                                    onClick={handleDecrement}
                                    disabled={quantity <= 1 || product.stock === 0}
                                >
                                    <Minus size={16} />
                                </Button>
                                <Input
                                    id="quantity"
                                    type="text"
                                    value={quantity}
                                    readOnly
                                    className="w-full text-center font-bold text-lg p-3 border border-border bg-background rounded-lg"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 flex-shrink-0"
                                    onClick={handleIncrement}
                                    disabled={quantity >= product.stock || product.stock === 0}
                                >
                                    <Plus size={16} />
                                </Button>
                            </div>
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

                    <Button variant="link" className="w-full mt-6 text-muted-foreground" onClick={() => setIsTipsOpen(true)}>
                        Show Buying Tips
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;