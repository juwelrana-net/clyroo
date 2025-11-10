// client/src/components/ProductCard.jsx

import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { CircleDollarSign } from 'lucide-react'; // <-- Wallet icon ko badla

const ProductCard = ({ product }) => {
    const placeholderUrl = `https://placehold.co/400x250/000000/FFFFFF?text=Product`;

    if (!product || !product._id) {
        return null;
    }

    const hasStock = product.stock > 0;

    return (
        <div className="border border-border/50 rounded-3xl overflow-hidden bg-secondary/30 shadow-md transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg flex flex-col">

            {/* Image Section */}
            <div className="relative h-48 bg-muted/50 flex items-center justify-center p-4">
                <img
                    src={product.imageUrl || placeholderUrl}
                    alt={product.name}
                    // --- UI UPDATE ---
                    // 3. "object-cover" ko "object-contain" kiya taaki image kate nahi
                    className="h-full w-full object-contain object-center"
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
                />
                {/* Autoship Badge */}
                <Badge variant="green" className="absolute top-4 left-4">
                    Autoship
                </Badge>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-grow">
                {/* Title */}
                <h4 className="text-lg font-semibold text-primary mb-1">{product.name}</h4>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-[40px]">
                    {product.description || "Digital product delivery."}
                </p>

                {/* --- UI UPDATE --- */}
                {/* 4. Payment text ko "Crypto" kiya */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <CircleDollarSign size={14} className="text-primary" />
                    <span>Payment: Crypto</span>
                </div>

                {/* Price & Stock */}
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                    <div className="text-2xl font-bold text-foreground">
                        ${product.price.toFixed(2)}
                    </div>
                    <Badge variant={hasStock ? "outline" : "destructive"} className={hasStock ? "border-green-500/50 text-green-400" : ""}>
                        {hasStock ? `Stock: ${product.stock}` : 'Out of Stock'}
                    </Badge>
                </div>
            </div>

            {/* Footer Section (Button) */}
            <div className="p-4 pt-0">
                <Link to={`/product/${product._id}`}>
                    <Button
                        className="w-full"
                        variant={hasStock ? "default" : "outline"}
                        disabled={!hasStock}
                    >
                        {hasStock ? 'Order Now' : 'Out of Stock'}
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;