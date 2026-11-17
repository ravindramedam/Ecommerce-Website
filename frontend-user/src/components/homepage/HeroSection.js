// frontend-user/src/components/homepage/HeroSection.js

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const banners = [
  {
    id: 1,
    imageUrl: "/Banners/banner-1.png",
    alt: "Your Fashion Your Rules. Discover Unlimited Styles of Fashion",
    ctaText: "Explore",
    ctaLink: "/products?sortBy=newest",
  },
  {
    id: 2,
    imageUrl: "/Banners/banner-2.png",
    alt: "Seasonal Sale - Up to 65% Off",
    ctaText: "Shop Sale",
    ctaLink: "/products?sortBy=topDiscounts",
  },
  {
    id: 3,
    imageUrl: "/Banners/banner-3.jpg",
    alt: "Men Style upto 30% Off",
    ctaText: "Shop Now",
    ctaLink: "/products?sortBy=newest",
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    alt: "Minimalist fashion banner",
    ctaText: "Discover Your Style",
    ctaLink: "/products",
  },
  {
    id: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1974&auto=format&fit=crop",
    alt: "Mid-season sale",
    ctaText: "Shop The Sale",
    ctaLink: "/products?sortBy=topDiscounts",
  },
  {
    id: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2070&auto=format&fit=crop",
    alt: "New Arrivals Banner",
    ctaText: "Explore New In",
    ctaLink: "/products?sortBy=newest",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="
        relative overflow-hidden rounded shadow-lg
        h-[260px] sm:h-[350px] md:h-[450px] lg:h-[500px]
      "
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`
            absolute inset-0 transition-opacity duration-700 
            ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}
          `}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.alt}
            fill
            className="object-cover"
            priority={index === 0}
            
          />

          {/* CTA BUTTON */}
          <div className="absolute bottom-6 left-6">
            <a
              href={banner.ctaLink}
              className="
                bg-blue-700 bg-opacity-70 hover:bg-opacity-90 
                text-white font-semibold rounded shadow-lg
                px-5 py-2 text-sm sm:text-base transition
              "
            >
              {banner.ctaText}
            </a>
          </div>
        </div>
      ))}

      {/* NAV DOTS */}
      <div className="absolute bottom-3 w-full text-center z-20">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            onClick={() => setCurrent(index)}
            className={`
              inline-block mx-1 rounded-full
              w-2 h-2 sm:w-3 sm:h-3
              ${index === current ? "bg-blue-600" : "bg-gray-300"}
            `}
          />
        ))}
      </div>
    </section>
  );
}
