// client/src/components/ProductCard.jsx

import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { CircleDollarSign } from 'lucide-react';

const ProductCard = ({ product }) => {
    const placeholderUrl = `https://placehold.co/400x250/000000/FFFFFF?text=Product`;

    if (!product || !product._id) {
        return null;
    }

    const hasStock = product.stock > 0;

    // Stock badge ka variable, jaisa pehle tha
    const stockBadge = (
        <Badge
            variant={hasStock ? "outline" : "destructive"}
            className={`
                ${hasStock ? "border-green-500/50 text-green-400" : ""}
                sm:px-2.5 sm:py-0.5 sm:text-xs  /* Desktop size */
                px-1.5 py-0 text-[10px]        /* Mobile size (extra small) */
                flex-shrink-0
            `}
        >
            {hasStock ? `Stock: ${product.stock}` : 'Out of Stock'}
        </Badge>
    );

    return (
        // Main container
        <div className="border border-border/50 rounded-3xl overflow-hidden bg-secondary/30 shadow-md transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg flex flex-row sm:flex-col">

            {/* Image Section */}
            <div className="relative h-auto sm:h-48 w-32 sm:w-full bg-muted/50 flex items-center justify-center p-4 flex-shrink-0">
                <img
                    src={product.imageUrl || placeholderUrl}
                    alt={product.name}
                    className="h-full w-full object-contain object-center"
                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
                />
                <Badge variant="green" className="absolute top-2 left-2 sm:top-4 sm:left-4 px-1.5 sm:px-2.5 py-0 sm:py-0.5 text-[10px] sm:text-xs">
                    Autoship
                </Badge>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">

                {/* Top Content (Title, Descriptions, Price) */}
                <div className="flex-grow">

                    {/* --- MOBILE: Title + Stock --- */}
                    <div className="sm:hidden flex justify-between items-center mb-1">
                        <h4 className="text-base font-semibold text-primary line-clamp-1">
                            {product.name}
                        </h4>
                        <div className="ml-2">
                            {stockBadge}
                        </div>
                    </div>

                    {/* --- DESKTOP: Title --- */}
                    <h4 className="hidden sm:block text-lg font-semibold text-primary mb-1">
                        {product.name}
                    </h4>

                    {/* --- DESKTOP: Description --- */}
                    <p className="hidden sm:block text-sm text-muted-foreground mb-3 line-clamp-2 h-[40px]">
                        {product.description || "Digital product delivery."}
                    </p>

                    {/* --- DESKTOP: Payment info --- */}
                    {/* Yeh ab `hidden sm:flex` hai (pichle code se change) */}
                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <CircleDollarSign size={14} className="text-primary" />
                        <span>Payment: Crypto</span>
                    </div>

                    {/* --- Price (Dono par dikhega) --- */}
                    {/* Desktop par yeh border top ke saath ayega */}
                    <div className="text-xl sm:text-2xl font-bold text-foreground sm:pt-3 sm:border-t sm:border-border/50">
                        ${product.price.toFixed(2)}
                    </div>

                    {/* --- MOBILE: Description (Desktop par hidden) --- */}
                    {/* --- UPDATE: Gap badhane ke liye 'mt-2' add kiya --- */}
                    <p className="block sm:hidden text-xs text-muted-foreground mt-2 line-clamp-2 h-[30px]">
                        {product.description || "Digital product delivery."}
                    </p>

                    {/* --- MOBILE: Payment Info (Desktop par hidden) --- */}
                    {/* --- YEH POORA BLOCK NAYA HAI --- */}
                    <div className="block sm:hidden text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            <CircleDollarSign size={12} className="text-primary" />
                            <span>Payment: Crypto</span>
                        </div>
                    </div>
                    {/* --- NAYA BLOCK KHATAM --- */}


                    {/* --- DESKTOP: Stock (Mobile par hidden) --- */}
                    <div className="hidden sm:block mt-2">
                        {stockBadge}
                    </div>
                </div>

                {/* Button Section */}
                {/* `mt-auto` isse hamesha card ke bottom mein rakhega */}
                <div className="pt-4 mt-auto">
                    <Link to={`/product/${product._id}`}>
                        <Button
                            className="w-full"
                            size="sm" // Mobile par chhota button
                            sm:size="default" // Desktop par default size
                            variant={hasStock ? "default" : "outline"}
                            disabled={!hasStock}
                        >
                            {hasStock ? 'Order Now' : 'Out of Stock'}
                        </Button>
                    </Link>
                </div>

            </div> {/* Content Section ka end */}
        </div> /* Main Container ka end */
    );
};

export default ProductCard;