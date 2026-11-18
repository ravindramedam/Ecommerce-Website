// frontend-user/src/components/homepage/ProductCarouselRow.js
"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import ProductCard from "@/components/products/ProductCard";

// ------------------------------------------------------
// MOBILE MINI CARD (Fixed: Toast + Redirect for Variants)
// ------------------------------------------------------
function MiniProductCard({ product }) {
  const router = useRouter();
  const { addItem, cartItems, isUpdating } = useCart();
  const [isBuying, setIsBuying] = useState(false);

  // --- SMART PRICE FINDER ---
  const price = Number(product.price || product.variants?.[0]?.price || 0);
  
  const oldPrice = Number(
    product.oldPrice || 
    product.mrp || 
    product.variants?.[0]?.oldPrice || 
    product.variants?.[0]?.mrp || 
    0
  );
  
  const isDiscountable = oldPrice > price;
  const discount = isDiscountable 
    ? Math.round(((oldPrice - price) / oldPrice) * 100) 
    : 0;

  // --- CART CHECK ---
  const isInCart = useMemo(() => 
    cartItems?.some(item => item.productId?._id === product._id), 
  [cartItems, product._id]);

  // --- HANDLER: ADD TO CART ---
  const handleAddToCart = async (e) => {
    e.preventDefault(); 
    
    // 1. IF VARIANTS: Toast + Redirect to PDP
    if (product.hasVariants) {
      toast("Please select Size & Color first", { 
        icon: "👉",
        style: {
          borderRadius: "20px",
          background: "#333",
          color: "#fff",
          fontSize: "12px"
        }
      });
      router.push(`/products/${product._id}`);
      return;
    }

    // 2. If already in cart, go to cart
    if (isInCart) {
      router.push("/cart");
      return;
    }

    // 3. Add to Cart
    await addItem(product._id, 1);
    toast.success("Added to cart!");
  };

  // --- HANDLER: BUY NOW ---
  const handleBuyNow = async (e) => {
    e.preventDefault();

    // 1. IF VARIANTS: Toast + Redirect to PDP
    if (product.hasVariants) {
      toast("Please select Size & Color first", { 
        icon: "👉",
        style: {
          borderRadius: "20px",
          background: "#333",
          color: "#fff",
          fontSize: "12px"
        }
      });
      router.push(`/products/${product._id}`);
      return;
    }

    if (isInCart) {
      router.push("/checkout");
      return;
    }

    setIsBuying(true);
    const success = await addItem(product._id, 1);
    if (success) {
      router.push("/checkout?source=buy_now");
    }
    setIsBuying(false);
  };

  return (
    <div className="w-full h-full flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex flex-col justify-between">
      
      {/* Link to Product Detail */}
      <Link href={`/products/${product._id}`} className="block">
        {/* IMAGE */}
        <div className="w-full h-24 relative rounded overflow-hidden bg-gray-50">
          <Image
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 200px"
          />
        </div>

        {/* BRAND */}
        <p className="mt-2 text-[9px] text-gray-500 font-semibold uppercase truncate leading-none">
          {product.brand || "Brand"}
        </p>

        {/* NAME */}
        <p className="text-[10px] text-gray-700 font-medium truncate leading-tight mb-1">
          {product.name}
        </p>
      </Link>

      {/* BOTTOM SECTION: PRICE & BUTTONS */}
      <div className="mt-1">
        
        {/* PRICE ROW */}
        <div className="flex items-center gap-1 flex-wrap min-h-[14px]">
          <span className="text-black font-bold text-[10px]">
            ₹{price}
          </span>
          
          {isDiscountable && (
            <span className="text-gray-400 line-through text-[8px]">
              ₹{oldPrice}
            </span>
          )}
          
          {discount > 0 && (
            <span className="text-green-600 text-[8px] font-semibold">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* BUTTON ROW */}
        <div className="flex gap-1 mt-2">
          
          {/* ADD BUTTON */}
          <button
            className={`
              flex-1 text-[9px] py-1.5 rounded font-semibold shadow-sm active:scale-95 transition
              ${isInCart ? "bg-green-600 text-white" : "bg-white text-black border border-gray-300"}
            `}
            onClick={handleAddToCart}
            disabled={isUpdating}
          >
            {isUpdating && !isInCart ? "..." : isInCart ? "In Cart" : "Add"}
          </button>

          {/* BUY BUTTON */}
          <button
            className="flex-1 bg-blue-600 text-white text-[9px] py-1.5 rounded font-semibold shadow-sm active:scale-95 transition disabled:opacity-70"
            onClick={handleBuyNow}
            disabled={isUpdating || isBuying}
          >
            {isBuying ? "..." : "Buy"}
          </button>

        </div>
      </div>
    </div>
  );
}
// ------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------
export default function ProductCarouselRow({ title, products, moreLink = "/products" }) {
  const scrollContainerRef = useRef(null);

  const handleScroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  return (
    <section className="relative group px-3 sm:px-4 md:px-0">

      {/* HEADER ROW */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          {title}
        </h2>

        {/* SHOW SEE ALL ON MOBILE TOO */}
        <Link
          href={moreLink}
          className="
            text-blue-600 font-semibold hover:underline
            text-sm sm:text-base
          "
        >
          See All
        </Link>
      </div>

      {/* HORIZONTAL SCROLL ROW */}
      <div
        ref={scrollContainerRef}
        className="
          flex overflow-x-auto no-scrollbar
          space-x-3 sm:space-x-4
          pb-2
        "
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            style={{ scrollSnapAlign: "start" }}
            className="
              flex-shrink-0
              w-[40%]      /* Mobile Width */
              sm:w-[200px] /* Tablet Width */
              md:w-[260px] /* Desktop Width */
              flex         /* Key for stretching height */
            "
          >
            {/* DESKTOP PRODUCT CARD */}
            <div className="hidden md:block w-full">
              <ProductCard product={product} />
            </div>

            {/* MOBILE MINI CARD */}
            <div className="block md:hidden w-full">
              <MiniProductCard product={product} />
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP SCROLL BUTTONS */}
      <button
        onClick={() => handleScroll(-300)}
        className="
          hidden md:flex
          absolute top-1/2 left-0 -translate-y-1/2 -ml-3
          bg-white rounded-full p-3 shadow-lg z-10
          opacity-0 group-hover:opacity-100 transition-all duration-300
          hover:bg-gray-50 border border-gray-100
        "
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-gray-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
      </button>

      <button
        onClick={() => handleScroll(300)}
        className="
          hidden md:flex
          absolute top-1/2 right-0 -translate-y-1/2 -mr-3
          bg-white rounded-full p-3 shadow-lg z-10
          opacity-0 group-hover:opacity-100 transition-all duration-300
          hover:bg-gray-50 border border-gray-100
        "
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-gray-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
        </svg>
      </button>
    </section>
  );
}