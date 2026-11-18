"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; 

export default function ProductInfo({ product }) {
  const { 
    name = "Product Name Unavailable", 
    brand = "Brand Unavailable", 
    price = 0, 
    mrp = 0, 
    description = "No description available.",
    discount: extraDiscount = 0, 
    specifications = {}, 
    tags = [],
    category,
    subcategory
  } = product || {}; 
  
  const categoryName = typeof category === 'object' ? category?.name : category;

  // --- STATE FOR ANIMATION ---
  const [revealDeal, setRevealDeal] = useState(false);

  // --- CALCULATIONS ---
  const discountPercentage = mrp > price 
    ? Math.round(((mrp - price) / mrp) * 100) 
    : 0;

  const hasExtraDiscount = extraDiscount > 0;
  const finalPrice = hasExtraDiscount 
    ? Math.round(price - (price * (extraDiscount / 100))) 
    : price;

  // --- EFFECT: TRIGGER ANIMATION ---
  useEffect(() => {
    if (hasExtraDiscount) {
      const timer = setTimeout(() => {
        setRevealDeal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasExtraDiscount]);

  return (
    <div className="w-full">
      
      {/* BREADCRUMBS (Category / Subcategory) */}
      <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-gray-500 mb-3">
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        
        {categoryName && (
          <>
            <Link 
              href={`/products?category=${categoryName}`} 
              className="hover:text-blue-600 transition-colors uppercase"
            >
              {categoryName}
            </Link>
            {subcategory && <span>/</span>}
          </>
        )}

        {subcategory && (
          <Link 
            href={`/products?subcategory=${subcategory}`}
            className="hover:text-blue-600 transition-colors capitalize"
          >
            {subcategory}
          </Link>
        )}
      </div>

      {/* Brand & Name */}
      <p className="text-gray-500 text-sm mb-1 uppercase tracking-wide font-bold text-blue-600/80">{brand}</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{name}</h1>
      
      {/* --- PRICE BLOCK --- */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        
        {/* ROW 1: Standard Price */}
        <div className={`flex items-baseline gap-3 transition-all duration-500 ease-in-out ${revealDeal ? "opacity-60 scale-95 origin-left" : "opacity-100"}`}>
          
          <span className={`text-3xl font-bold text-black transition-colors duration-500 ${revealDeal ? "line-through decoration-black decoration-2" : ""}`}>
            ₹{price.toFixed(0)}
          </span>
          
          {mrp > price && (
            <span className="text-xl line-through text-gray-400">₹{mrp.toFixed(0)}</span>
          )}
          
          {discountPercentage > 0 && (
            <span className="text-lg font-bold text-green-600">({discountPercentage}% OFF)</span>
          )}
        </div>

        {/* ROW 2: EXTRA DEAL REVEAL */}
        {hasExtraDiscount && (
          <div 
            className={`
              overflow-hidden transition-all duration-700 ease-out
              ${revealDeal ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}
            `}
          >
            <div className="flex items-center gap-3">
              
              {/* Final Price */}
              <span className="text-4xl font-bold text-black leading-none">
                ₹{finalPrice.toFixed(0)}
              </span>

              {/* Arrow Icon (Moved to Right) */}
              <div className="text-green-500 animate-bounce pt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
              </div>

              {/* Pulsing Badge */}
              <div className="flex flex-col ml-1">
                <span className="bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-2 py-1 rounded animate-pulse">
                  EXTRA {extraDiscount}% OFF
                </span>
                <span className="text-[10px] text-gray-500 font-medium ml-1">
                  Limited Time Deal
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-2 uppercase text-sm tracking-wide">Product Description</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
          {description}
        </p>
      </div>

      {/* --- SPECIFICATIONS TABLE --- */}
      {(specifications.material || specifications.fit || specifications.care || specifications.origin) && (
        <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 uppercase text-sm tracking-wide">Product Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                
                {specifications.material && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Material</span>
                        <span className="text-gray-900 font-medium text-right">{specifications.material}</span>
                    </div>
                )}

                {specifications.fit && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Fit</span>
                        <span className="text-gray-900 font-medium text-right">{specifications.fit}</span>
                    </div>
                )}

                {specifications.care && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Care</span>
                        <span className="text-gray-900 font-medium text-right">{specifications.care}</span>
                    </div>
                )}
                 {specifications.origin && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Origin</span>
                        <span className="text-gray-900 font-medium text-right">{specifications.origin}</span>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-full shadow-sm">
                    #{tag}
                </span>
            ))}
        </div>
      )}

    </div>
  );
}