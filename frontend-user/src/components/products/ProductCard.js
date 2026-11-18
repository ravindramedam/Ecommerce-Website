"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; 
import { useWishlist } from "@/contexts/WishlistContext";

export default function ProductCard({ product }) {
  const { _id, name, price, brand, images, mrp, hasVariants, discount: extraDiscount } = product;
  
  const imageUrl = images?.[0] || 'https://via.placeholder.com/400';

  // --- PRICING LOGIC ---
  const [revealDeal, setRevealDeal] = useState(false);

  // Admin Extra Discount
  const hasExtraDiscount = extraDiscount && extraDiscount > 0;
  
  // Final Price (Price - Extra %)
  const finalPrice = hasExtraDiscount 
    ? Math.round(price - (price * (extraDiscount / 100))) 
    : price;

  // PERCENTAGE 1: Standard Discount (MRP vs Price) -> FOR ORANGE TEXT
  const standardDiscountPercentage = mrp > price 
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  // PERCENTAGE 2: Total Savings (MRP vs Final Price) -> FOR RED IMAGE BADGE
  // It gives the customer the "Max Savings" view
  const totalDiscountPercentage = mrp > finalPrice 
    ? Math.round(((mrp - finalPrice) / mrp) * 100)
    : 0;

  // Animation Trigger
  useEffect(() => {
    if (hasExtraDiscount) {
      const timer = setTimeout(() => {
        setRevealDeal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasExtraDiscount]);


  // --- HOOKS ---
  const router = useRouter();
  const { add, remove, wishlist } = useWishlist();
  const { cartItems, addItem, isUpdating } = useCart();
  const [isBuying, setIsBuying] = useState(false);

  // --- CHECKS ---
  const isWishlisted = useMemo(() => wishlist?.some(item => item.productId?._id === _id), [wishlist, _id]);
  const isInCart = useMemo(() => cartItems?.some(item => item.productId?._id === _id), [cartItems, _id]);

  // --- HANDLERS ---
  const handleWishlistClick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (hasVariants) { 
       toast("Please select options", { icon: "👉", style: { fontSize: "12px" } });
       router.push(`/products/${_id}`); return; 
    }
    if (isWishlisted) { await remove(_id); toast.success("Removed"); } 
    else { await add(_id); toast.success("Saved"); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (hasVariants) { 
      toast("Please select options", { icon: "👉", style: { fontSize: "12px" } });
      router.push(`/products/${_id}`); return; 
    }
    if (isInCart) { router.push("/cart"); return; }
    await addItem(_id, 1); 
    toast.success("Added to cart!");
  };

  const handleBuyNow = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (hasVariants) {
      toast("Please select options", { icon: "👉", style: { fontSize: "12px" } });
      router.push(`/products/${_id}`); return;
    }
    if (isInCart) { router.push('/checkout'); return; }
    setIsBuying(true);
    const success = await addItem(_id, 1);
    if (success) { router.push('/checkout?source=buy_now'); }
    setIsBuying(false);
  };

  return (
    <Link href={`/products/${_id}`}>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden flex flex-col h-full border border-gray-100 group transition-shadow hover:shadow-md relative">
        
        {/* TOP BADGE: Uses Total Savings (MRP - Final Price) */}
        {totalDiscountPercentage > 0 && (
          <div className="absolute top-2 left-0 z-20">
             <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-r shadow-md">
                {totalDiscountPercentage}% OFF
             </span>
          </div>
        )}

        {/* IMAGE AREA */}
        <div className="relative">
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm z-10 active:scale-90 transition-transform"
          >
            {isWishlisted ? (
              <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
            )}
          </button>

          <Image 
            src={imageUrl}
            alt={name}
            width={300}
            height={400}
            className="h-40 sm:h-52 w-full object-cover"
          />
        </div>

        {/* CONTENT AREA */}
        <div className="p-2 sm:p-3 flex flex-col flex-grow">
          <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5 uppercase tracking-wide font-bold truncate">
            {brand}
          </p>
          <h3 className="font-medium text-xs sm:text-sm mb-2 line-clamp-2 text-gray-800 leading-tight h-8 sm:h-10">
            {name}
          </h3>

          {/* --- PRICE SECTION --- */}
          <div className="mb-2 min-h-[36px] flex flex-col justify-center">
            
            {/* ROW 1: Standard Pricing (Price, MRP, Orange Discount) */}
            <div className={`flex items-baseline gap-1.5 flex-wrap transition-all duration-500 ${revealDeal ? "opacity-60 scale-95 origin-left" : "opacity-100"}`}>
                
                {/* Selling Price */}
                <span className={`font-bold text-sm sm:text-lg text-black transition-colors duration-500 ${revealDeal ? "line-through decoration-black" : ""}`}>
                  ₹{price.toFixed(0)}
                </span>

                {/* MRP */}
                {mrp > price && (
                  <span className="line-through text-gray-400 text-[10px] sm:text-xs">
                    ₹{mrp.toFixed(0)}
                  </span>
                )}

                {/* ORANGE PERCENTAGE (Standard Discount) */}
                {standardDiscountPercentage > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-green-600 truncate">
                    ({standardDiscountPercentage}% OFF)
                  </span>
                )}
            </div>

            {/* ROW 2: Deal Reveal (Slides Down if Extra Discount exists) */}
            {hasExtraDiscount && (
              <div className={`
                  overflow-hidden transition-all duration-500 ease-out flex items-center gap-2
                  ${revealDeal ? "max-h-10 opacity-100 mt-0.5" : "max-h-0 opacity-0"}
              `}>
                  <span className="text-lg sm:text-xl font-bold text-black leading-none">
                    ₹{finalPrice.toFixed(0)}
                  </span>
                  
                  <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-1 py-0.5 rounded border border-green-200 animate-pulse">
                    <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase">
                      Extra {extraDiscount}%
                    </span>
                  </div>
              </div>
            )}

          </div>

          {/* BUTTON ROW */}
          <div className={`
            flex gap-2 mt-auto
            transition-all duration-300 transform
            opacity-100 translate-y-0
            md:opacity-0 md:translate-y-2
            md:group-hover:opacity-100 md:group-hover:translate-y-0
          `}>
            
            <button
              className={`
                flex-1 py-1.5 rounded text-[10px] sm:text-xs font-bold shadow-sm transition-colors
                ${isInCart ? "bg-green-600 text-white" : "bg-white text-black border border-gray-300 hover:bg-gray-50"}
              `}
              onClick={handleAddToCart}
              disabled={isUpdating}
            >
              {isUpdating && !isInCart ? "..." : isInCart ? "In Cart" : "Add"}
            </button>

            <button
              className="flex-1 py-1.5 rounded text-[10px] sm:text-xs font-bold shadow-sm transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
              onClick={handleBuyNow}
              disabled={isUpdating || isBuying}
            >
              {isBuying ? "..." : "Buy"}
            </button>

          </div>
        </div>
      </div>
    </Link>
  );
}