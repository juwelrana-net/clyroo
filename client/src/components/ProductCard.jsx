// client/src/components/ProductCard.jsx

import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx'; // <-- Badge ko import karein
import { Wallet } from 'lucide-react'; // Payment icon ke liye

const ProductCard = ({ product }) => {
    const placeholderUrl = `https://placehold.co/400x250/000000/FFFFFF?text=Digital+Product`;

    if (!product || !product._id) {
        return null;
    }

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-secondary/30 shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl relative">

            {/* --- BADGE (Tag) --- */}
            <Badge variant="green" className="absolute top-3 left-3">
                Autoship
            </Badge>

            {/* Image Placeholder */}
            <div className="h-40 bg-muted flex items-center justify-center">
                <img
                    src={product.imageUrl || placeholderUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-opacity duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
                />
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="text-lg font-semibold text-primary">{product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description || "Digital product delivery."}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 pt-2 border-t border-border/50">
                    {/* Price */}
                    <div className="text-2xl font-bold text-foreground">
                        ${product.price.toFixed(2)}
                    </div>
                    {/* Stock */}
                    <div className={`text-xs font-medium px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                    </div>
                </div>

                {/* Payment Method & Buy Button */}
                <div className="flex flex-col gap-3">
                    {/* USDT Tag */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border border-border/50 rounded-md p-2">
                        <Wallet size={14} className="text-primary" />
                        <span>Payment: USDT (ERC20)</span>
                    </div>

                    {/* Buy Button */}
                    <Link to={`/product/${product._id}`}>
                        <Button
                            className="w-full"
                            variant={product.stock > 0 ? "default" : "outline"}
                            disabled={product.stock === 0}
                        >
                            {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard; // <-- YEH LINE FIX HO GAYI HAI