// frontend-user/src/components/account-hub/Terms.js

"use client";

export default function Terms() {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 text-[10px] sm:text-sm leading-relaxed">

      {/* HEADER */}
      <h2 className="text-[14px] sm:text-2xl font-bold text-gray-800 mb-1">
        Terms & Conditions
      </h2>

      <p className="text-[9px] sm:text-sm text-gray-500 mb-4">
        Last Updated: December 2025
      </p>

      {/* CONTENT WRAPPER */}
      <div className="max-w-none h-[500px] sm:h-[600px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar text-gray-700">

        {/* SECTION 1 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-3 mb-1">
          1. Introduction
        </h3>
        <p className="text-[10px] sm:text-sm">
          Welcome to <strong>Satya&apos;s Fashion Book</strong>. These terms and conditions outline 
          the rules and regulations for the use of our website and services. By accessing 
          this website, you accept these terms in full.
        </p>

        {/* SECTION 2 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          2. Account Registration
        </h3>
        <p className="text-[10px] sm:text-sm">
          To place an order, you must register an account. You agree to provide accurate 
          and current information, and safeguard your account credentials. You are responsible 
          for any activity on your account.
        </p>

        {/* SECTION 3 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          3. Product Information
        </h3>
        <p className="text-[10px] sm:text-sm">
          We attempt to display products as accurately as possible. However, we cannot guarantee 
          exact color accuracy due to varied device displays.
        </p>

        {/* SECTION 4 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          4. Pricing and Payment
        </h3>
        <p className="text-[10px] sm:text-sm">
          All prices are in INR and include taxes unless stated otherwise. Prices may change 
          without notice. We currently accept <strong>Cash on Delivery (COD)</strong>.
        </p>

        {/* SECTION 5 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          5. Shipping and Delivery
        </h3>
        <p className="text-[10px] sm:text-sm">
          Deliveries are limited to select locations. Delivery timelines are estimates only. 
          Risk of loss passes to you once the product is handed to the carrier.
        </p>

        {/* SECTION 6 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          6. Returns and Cancellations
        </h3>

        <ul className="list-disc pl-4 space-y-1 text-[10px] sm:text-sm">
          <li>
            <strong>Cancellations:</strong> Orders in “Pending” can be canceled instantly. 
            “Processing” orders require admin approval. No cancellations once “Shipped”.
          </li>
          <li>
            <strong>Returns:</strong> Eligible for damaged or incorrect products reported 
            within 48 hours. Items must be unused and in original packaging.
          </li>
        </ul>

        {/* SECTION 7 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          7. Limitation of Liability
        </h3>
        <p className="text-[10px] sm:text-sm">
          Satya&apos;s Fashion Book shall not be liable for any loss arising from your use 
          of this website, under any legal theory.
        </p>

        {/* SECTION 8 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          8. Governing Law
        </h3>
        <p className="text-[10px] sm:text-sm">
          These terms are governed by Indian law. Any disputes will be handled exclusively 
          in courts located in Rajahmundry, Andhra Pradesh.
        </p>

        {/* SECTION 9 */}
        <h3 className="text-[12px] sm:text-lg font-bold text-gray-800 mt-4 mb-1">
          9. Contact Information
        </h3>
        <p className="text-[10px] sm:text-sm">
          For queries:<br/>
          <strong>Ravi Boddapati</strong><br/>
          Phone: 7013491552<br/>
          Tadithota Jeevan Junction, Rajahmundry.
        </p>

        <div className="h-8"></div>
      </div>
    </div>
  );
}
