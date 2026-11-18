"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

// Contexts & Hooks
import { useCountdown } from "@/hooks/useCountdown";
import { useCart } from "@/contexts/CartContext";
import { getHomepageData } from "@/services/productService";

// Components
import ProductCard from "@/components/products/ProductCard";

// ------------------------------------------------------
// MINI PRODUCT CARD (MOBILE VERSION)
// Updated: Buttons on new line + Functional Logic
// ------------------------------------------------------
function MiniProductCard({ product }) {
  const router = useRouter();
  const { addItem, cartItems, isUpdating } = useCart();
  const [isBuying, setIsBuying] = useState(false);

  // --- 1. SMART PRICE LOGIC ---
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

  // --- 2. CART STATUS ---
  const isInCart = useMemo(() => 
    cartItems?.some(item => item.productId?._id === product._id), 
  [cartItems, product._id]);

  // --- 3. HANDLERS ---
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (product.hasVariants) {
      toast("Select options first", { icon: "👉", style: { fontSize: "12px" } });
      router.push(`/products/${product._id}`);
      return;
    }
    if (isInCart) { router.push("/cart"); return; }
    
    await addItem(product._id, 1);
    toast.success("Added to cart!");
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (product.hasVariants) {
      toast("Select options first", { icon: "👉", style: { fontSize: "12px" } });
      router.push(`/products/${product._id}`);
      return;
    }
    if (isInCart) { router.push("/checkout"); return; }

    setIsBuying(true);
    const success = await addItem(product._id, 1);
    if (success) { router.push("/checkout?source=buy_now"); }
    setIsBuying(false);
  };

  return (
    <div className="w-36 flex-shrink-0 bg-white rounded-lg shadow p-2 overflow-hidden flex flex-col justify-between h-full">

      {/* CLICKABLE AREA TO PDP */}
      <div onClick={() => router.push(`/products/${product._id}`)}>
        {/* IMAGE */}
        <div className="w-full h-28 relative rounded overflow-hidden bg-gray-50">
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

        {/* PRODUCT NAME */}
        <p className="text-[10px] text-gray-700 font-medium truncate leading-tight mb-1">
          {product.name}
        </p>
      </div>

      {/* PRICE & BUTTONS CONTAINER */}
      <div className="mt-auto">
        
        {/* PRICE ROW */}
        <div className="flex items-center gap-1 flex-wrap min-h-[14px]">
          <span className="text-black font-bold text-[11px]">
            ₹{price}
          </span>
          {isDiscountable && (
            <span className="text-gray-400 line-through text-[9px]">
              ₹{oldPrice}
            </span>
          )}
          {discount > 0 && (
            <span className="text-green-600 text-[9px] font-semibold">
              {discount}% off
            </span>
          )}
        </div>

        {/* BUTTON ROW */}
        <div className="flex gap-1 mt-2">
          
          {/* ADD BUTTON */}
          <button
            onClick={handleAddToCart}
            disabled={isUpdating}
            className={`
              flex-1 text-[9px] py-1.5 rounded font-semibold shadow-sm active:scale-95 transition
              ${isInCart ? "bg-green-600 text-white" : "bg-white text-black border border-gray-300"}
            `}
          >
            {isInCart ? "In Cart" : "Add"}
          </button>

          {/* BUY BUTTON */}
          <button
            onClick={handleBuyNow}
            disabled={isUpdating || isBuying}
            className="flex-1 bg-blue-600 text-white text-[9px] py-1.5 rounded font-semibold shadow-sm active:scale-95 transition disabled:opacity-70"
          >
            {isBuying ? "..." : "Buy"}
          </button>
        </div>

      </div>
    </div>
  );
}

// --- TIMER COMPONENT ---
const CountdownTimer = ({ days, hours, minutes, seconds }) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2 text-center">
      {[["Days", days], ["Hrs", hours], ["Mins", minutes], ["Secs", seconds]].map(
        ([label, value]) => (
          <div
            key={label}
            className="
              bg-red-600 p-1 sm:p-2 rounded-md shadow 
              min-w-[32px] sm:min-w-[48px] text-white
            "
          >
            <span className="block text-[10px] sm:text-lg font-bold leading-none">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[7px] sm:text-[10px] uppercase">{label}</span>
          </div>
        )
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function DealOfTheDay() {
  const [dealProducts, setDealProducts] = useState([]);
  const [targetDate, setTargetDate] = useState(Date.now() + 24 * 3600 * 1000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const data = await getHomepageData();
        if (data?.dealOfTheDay?.length) {
          setDealProducts(data.dealOfTheDay);
          if (data.dealOfTheDay[0].dealExpiry) {
            setTargetDate(new Date(data.dealOfTheDay[0].dealExpiry).getTime());
          }
        }
      } catch (err) {
        console.error("Error loading deal products:", err);
      }
      setLoading(false);
    };
    loadDeals();
  }, []);

  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (loading)
    return (
      <div className="h-64 bg-gray-200 animate-pulse rounded-lg my-6"></div>
    );

  if (!dealProducts.length) return null;

  return (
    <section
      className="
        bg-gray-900 text-white 
        py-6 sm:py-10 my-6 
        rounded-xl shadow-xl 
        relative overflow-hidden
      "
    >
      {/* BACKGROUND CIRCLE */}
      <div className="absolute top-0 right-0 w-40 h-40 sm:w-48 sm:h-48 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3"></div>

      <div className="relative z-10 px-4 max-w-7xl mx-auto">

        {/* HEADER ROW */}
        <div className="flex items-center justify-between w-full mb-4 sm:mb-8">
          <div>
            <h2
              className="
                text-lg sm:text-3xl font-extrabold uppercase tracking-tight
                bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent
              "
            >
              Deal of the Day ⚡
            </h2>

            <p className="text-gray-400 text-[10px] sm:text-sm leading-none">
              Limited-time offers — grab them before they’re gone!
            </p>
          </div>

          {(days + hours + minutes + seconds) > 0 ? (
            <CountdownTimer
              days={days}
              hours={hours}
              minutes={minutes}
              seconds={seconds}
            />
          ) : (
            <div className="bg-red-500 px-3 py-1 rounded-lg font-bold text-xs sm:text-lg shadow-lg whitespace-nowrap">
              EXPIRED
            </div>
          )}
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {dealProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* MOBILE → Mini cards horizontally */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {dealProducts.map((p) => (
            <MiniProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}