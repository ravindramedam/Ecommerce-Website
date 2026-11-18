// frontend-user/src/components/product-detail/ProductActions.js

"use client";

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/router'; 
import toast from 'react-hot-toast'; 
import { useWishlist } from "@/contexts/WishlistContext";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { cartItems, addItem, isUpdating, isLoading: isCartLoading } = useCart();
  const { add, remove, wishlist } = useWishlist();

  // ROUTER
  const router = useRouter(); 

  // --- STATES ---
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // --- HELPERS (No Changes) ---
  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.size))];
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.color))];
  }, [product]);

  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (product.hasVariants) {
        if (selectedSize && selectedColor) {
            const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
            return variant ? variant.stock : 0;
        }
        return 0; 
    }
    return product.stock || 0;
  }, [product, selectedSize, selectedColor]);

  // Check if item is in cart
  const isInCartContext = useMemo(() => {
    if (isCartLoading || !cartItems || !product?._id) return false;
    return cartItems.some(item => 
      item.productId?._id === product._id && 
      (!product.hasVariants || (item.size === selectedSize && item.color === selectedColor))
    );
  }, [cartItems, product, isCartLoading, selectedSize, selectedColor]);

  const showGoToCart = isInCartContext || justAdded;

  // WISHLISTED CHECK
  const isWishlisted = wishlist?.some(
    item => item.productId?._id === product._id
  );

  const toggleWishlist = async () => {
    if (!product._id) return;

    // If product has variants → size & color REQUIRED
    if (product.hasVariants) {
      if (!selectedSize) {
        toast("Please select Size", { icon: "👉" });
        return;
      }
      if (!selectedColor) {
        toast("Please select Color", { icon: "👉" });
        return;
      }
    }

    try {
      if (isWishlisted) {
        await remove(product._id, selectedSize, selectedColor);
        toast("Removed from wishlist ❤️‍🩹");
      } else {
        await add(product._id, selectedSize, selectedColor);
        toast("Added to wishlist ❤️");
      }
    } catch (err) {
      console.error("Wishlist error:", err.response?.data || err);
      toast.error("Wishlist update failed.");
    }
  };

  // --- VALIDATION ---
  const validateSelection = () => {
    if (product?.hasVariants) {
        if (!selectedSize) {
            toast('Please select Size', { icon: '👉', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
            return false;
        }
        if (!selectedColor) {
            toast('Please select Color', { icon: '👉', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
            return false;
        }
        
        const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
        if (!variant) {
            toast.error("Sorry, this combination is unavailable.");
            return false;
        }
        if (variant.stock < quantity) {
            toast.error(`Only ${variant.stock} left in stock!`);
            return false;
        }
    } else {
        if (product.stock < quantity) {
            toast.error("Out of stock.");
            return false;
        }
    }
    return true;
  };

  // --- HANDLER: ADD TO CART ---
  const handleAddToCart = async () => {
    if (!validateSelection()) return;

    setJustAdded(false);
    try {
      const success = await addItem(product._id, quantity, selectedSize, selectedColor);
      if (success) {
        setJustAdded(true);
        toast.success("Added to Cart!", { position: 'bottom-center' });
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error("Failed to add item.");
    }
  };

  // --- HANDLER: BUY NOW ---
  const handleBuyNow = async () => {
    // If already in cart, just go to checkout
    if (isInCartContext) {
      router.push('/checkout');
      return;
    }

    // Validate
    if (!validateSelection()) return;

    setIsBuyingNow(true);
    try {
      // Add to Cart FIRST
      const success = await addItem(product._id, quantity, selectedSize, selectedColor);
      
      if (success) {
        console.log("✅ Item added. Redirecting to checkout...");

        router.push({
            pathname: '/checkout',
            query: {
                source: 'buy_now',
                productId: product._id,
                size: selectedSize || '',
                color: selectedColor || ''
            }
        });
      }
    } catch (error) {
      console.error("Buy Now failed:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleGoToCart = () => router.push('/cart');

  useEffect(() => {
    if (!isInCartContext) setJustAdded(false);
  }, [selectedSize, selectedColor, isInCartContext]);

  const increaseQuantity = () => {
    if (quantity < currentStock) setQuantity(q => q + 1);
  };
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  if (!product) return null;

  return (
    <div className="w-full mt-6 pt-6 border-t">

      {/* --- VARIANTS --- */}
      {product.hasVariants && (
        <div className="mb-6 space-y-5">
            {/* Sizes */}
            <div>
                <span className="font-semibold text-gray-700 block mb-2">Select Size:</span>
                <div className="flex gap-3 flex-wrap">
                    {availableSizes.map(size => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[50px] px-3 py-2 border rounded-md text-sm font-semibold transition-all
                                ${selectedSize === size 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-1' 
                                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div>
                <span className="font-semibold text-gray-700 block mb-2">Select Color:</span>
                <div className="flex gap-3 flex-wrap">
                    {availableColors.map(color => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 border rounded-md text-sm font-semibold transition-all flex items-center gap-2
                                ${selectedColor === color 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-1' 
                                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'}`}
                        >
                            {color}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* --- QUANTITY --- */}
      {!showGoToCart && (
          <div className="flex items-center gap-4 mb-6">
             <span className="font-semibold text-gray-700">Quantity:</span>
             <div className="flex items-center border rounded-md">
                <button
                  onClick={decreaseQuantity}
                  className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-6 py-2 text-lg font-semibold">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  disabled={(product.hasVariants && (!selectedSize || !selectedColor)) || quantity >= currentStock}
                >
                  +
                </button>
             </div>
             
             <span className="text-sm text-gray-500">
                {product.hasVariants 
                    ? (selectedSize && selectedColor ? `(${currentStock} available)` : '(Select size & color)') 
                    : `(${product.stock} available)`}
             </span>
          </div>
      )}
      
      {showGoToCart && (
        <p className="text-green-600 font-semibold mb-4 bg-green-50 p-3 rounded border border-green-200 inline-block">
            ✓ Item added to cart.
        </p>
      )}

      {/* --- BUTTONS --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* ADD TO CART */}
        <button
          onClick={showGoToCart ? handleGoToCart : handleAddToCart}
          disabled={isUpdating}
          className={`flex-1 py-3 px-6 font-bold rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
            showGoToCart
              ? 'bg-gray-800 text-white hover:bg-gray-900' 
              : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isUpdating && !isBuyingNow && !showGoToCart
            ? 'Adding...'
            : showGoToCart
              ? 'Go to Cart'
              : 'Add to Cart'
          }
        </button>

        {/* BUY NOW */}
        <button
          onClick={handleBuyNow}
          disabled={isUpdating} 
          className="flex-1 py-3 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isBuyingNow ? 'Processing...' : 'Buy Now'}
        </button>

        {/* WISHLIST */}
        <button
          onClick={toggleWishlist}
          className={`py-3 px-4 border rounded-lg flex items-center justify-center transition 
            ${isWishlisted ? "border-red-500 bg-red-50 text-red-600" : "border-gray-300 text-gray-500 hover:text-red-500"}
          `}
        >
          {isWishlisted ? "♥ Saved" : "♡ Wishlist"}
        </button>

      </div>
    </div>
  );
}