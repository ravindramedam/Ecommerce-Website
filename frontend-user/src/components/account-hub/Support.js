// frontend-user/src/components/account-hub/Support.js

"use client";

export default function Support() {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 animate-fadeIn 
                    text-[10px] sm:text-sm">

      {/* TITLE */}
      <h2 className="text-[14px] sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Customer Support
      </h2>

      {/* GRID: STORE + TECH SUPPORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* --------------------------- */}
        {/* 1. STORE SUPPORT CARD       */}
        {/* --------------------------- */}

        <div className="bg-blue-50 p-3 sm:p-5 rounded-xl border border-blue-100">

          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <h3 className="text-[12px] sm:text-lg font-bold text-blue-900">
              Store & Orders
            </h3>
          </div>

          <p className="text-[10px] sm:text-sm text-blue-800 mb-3 sm:mb-4 leading-snug">
            For product questions, availability, or order status updates.
          </p>

          <div className="space-y-3 sm:space-y-4">

            {/* Manager 1 */}
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <span className="text-lg sm:text-xl mt-1">📞</span>

              <div>
                <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-bold">Manager - 1</p>
                <p className="font-semibold text-gray-800 text-[11px] sm:text-base">Durga Rao</p>

                <div className="flex flex-col text-[10px] sm:text-sm mt-1 gap-1">
                  <a href="tel:8978331433" className="text-blue-600 hover:underline">
                    8978331433
                  </a>
                  <a href="mailto:boddapatidurgarao1999@gmail.com"
                     className="text-gray-500 hover:text-blue-600 text-[9px] sm:text-xs">
                    boddapatidurgarao1999@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Manager 2 */}
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <span className="text-lg sm:text-xl mt-1">📞</span>

              <div>
                <p className="text-[9px] sm:text-xs text-gray-500 uppercase font-bold">Manager - 2</p>
                <p className="font-semibold text-gray-800 text-[11px] sm:text-base">Mahesh</p>

                <div className="flex flex-col text-[10px] sm:text-sm mt-1 gap-1">
                  <a href="tel:9550531600" className="text-blue-600 hover:underline">
                    9550531600
                  </a>
                  <a href="mailto:rockstart31600@gmail.com"
                     className="text-gray-500 hover:text-blue-600 text-[9px] sm:text-xs">
                    rockstart31600@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --------------------------- */}
        {/* 2. TECH SUPPORT CARD        */}
        {/* --------------------------- */}

        <div className="bg-purple-50 p-3 sm:p-5 rounded-xl border border-purple-100 flex flex-col h-full">

          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>

              <h3 className="text-[12px] sm:text-lg font-bold text-purple-900">
                Website & Tech
              </h3>
            </div>

            <p className="text-[10px] sm:text-sm text-purple-800 mb-3 sm:mb-4 leading-snug">
              Facing issues with sign-in, payments, or website errors?
            </p>

            {/* DEVELOPER CARD */}
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm mb-4 sm:mb-6">
              <span className="text-lg sm:text-xl mt-1">👨‍💻</span>

              <div>
                <p className="text-[9px] sm:text-xs uppercase text-gray-500 font-bold">Developer / Techie</p>
                <p className="font-semibold text-gray-800 text-[11px] sm:text-base">Medam Ravindra</p>

                <div className="flex flex-col text-[10px] sm:text-sm mt-1 gap-1">
                  <a href="tel:7013491552" className="text-black-600 hover:underline">7013491552</a>
                  <a href="mailto:ravindramedam321@gmail.com"
                     className="text-black-500 hover:text-black-600 text-[9px] sm:text-xs">
                    ravindramedam321@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* INSTAGRAM */}
          <div className="mt-auto bg-gradient-to-r from-pink-500 to-purple-600 p-3 sm:p-4 rounded-xl text-white shadow-md">

            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85..."></path>
              </svg>
              <span className="font-bold text-[11px] sm:text-base">Follow Us for Updates!</span>
            </div>

            <p className="text-[9px] sm:text-xs text-pink-100 mb-3 leading-snug">
              Catch new arrivals, exclusive offers, and flash sales first on Instagram.
            </p>

            <a
              href="https://www.instagram.com/satyas_fashion_book/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-white text-pink-600 text-[10px] sm:text-xs font-bold py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
              Visit @satyas_fashion_book
            </a>
          </div>
        </div>
      </div>

      {/* --------------------------- */}
      {/* 3. LOCATION CARD            */}
      {/* --------------------------- */}

      <div className="mt-5 sm:mt-6 bg-gray-50 p-3 sm:p-5 rounded-xl border border-gray-200">

        <div className="flex items-start gap-3 sm:gap-4">

          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 text-white rounded-full flex-shrink-0 flex items-center justify-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998..."></path>
            </svg>
          </div>

          <div className="text-[10px] sm:text-sm">
            <h3 className="text-[12px] sm:text-lg font-bold text-gray-900">Visit Our Store</h3>

            <p className="text-gray-600 mt-2 leading-snug">
              <strong>Satya&apos;s Fashion Book</strong><br />
              2Q3J+GX5, Gorakshanapeta,<br />
              Rajamahendravaram, Andhra Pradesh 533103.<br />
              <span className="text-gray-500 text-[9px] sm:text-xs">
                (Opp. Siva Biryani, Tadithota Jeevan Junction)
              </span>
            </p>

            <div className="mt-3">
              <a
                href="https://www.google.com/maps/place/Satyas+fashion+book..."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] sm:text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View on Google Maps →
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
