// frontend-user/src/components/account-hub/orders/OrderCard.js

"use client";
import Link from "next/link";
import Image from "next/image";

export default function OrderCard({ order, onOpenCancel, onOpenRequestView, showActions = true }) {

  /** -------------------------------------------------------------
   *   FULL 4-STEP TIMELINE (Pending → Delivered) 
   *   Visible, compact, responsive 
   * ------------------------------------------------------------- */
  const renderTimeline = (status) => {

    const steps = [
      { key: "Pending", label: "Pending" },
      { key: "Processing", label: "Processing" },
      { key: "Shipped", label: "Shipped" },
      { key: "Delivered", label: "Delivered" }
    ];

    const currentIndex = steps.findIndex(s => s.key === status);

    return (
      <div className="w-full grid grid-cols-4 mt-3 sm:mt-4">
        {steps.map((step, idx) => {
          const active = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const leftDone = idx > 0 && idx <= currentIndex;
          const rightDone = idx < currentIndex;

          return (
            <div key={step.key} className="relative flex flex-col items-center">
              {idx > 0 && (
                <div className={`absolute top-[5px] sm:top-2 left-0 right-1/2 h-0.5 ${leftDone ? "bg-blue-500" : "bg-gray-300"}`} />
              )}
              {idx < steps.length - 1 && (
                <div className={`absolute top-[5px] sm:top-2 left-1/2 right-0 h-0.5 ${rightDone ? "bg-blue-500" : "bg-gray-300"}`} />
              )}

              <div
                className={`
                  relative z-10 rounded-full transition-all
                  ${active ? (isCurrent ? "bg-blue-600 scale-110" : "bg-blue-500") : "bg-gray-300"}
                  w-2.5 h-2.5 sm:w-4 sm:h-4
                `}
              />

              <span
                className={`
                  mt-1 text-[8px] sm:text-xs font-medium text-center
                  ${active ? "text-blue-600" : "text-gray-500"}
                  ${isCurrent ? "underline underline-offset-2" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  /** -------------------------------------------------------------
   *   MAIN ORDER CARD
   * ------------------------------------------------------------- */
  return (
    <Link href={`/orders/${order._id}`} className="block">
      
      <div className="border rounded-lg bg-white overflow-hidden group hover:shadow-md transition-all mb-4">

        {/* HEADER */}
        <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[10px] sm:text-sm">

          {/* LEFT: Order Date + Total */}
          <div className="flex gap-4 sm:gap-6">

            <div>
              <span className="block text-gray-500 text-[9px] sm:text-xs uppercase tracking-wider">
                Placed On
              </span>
              <span className="font-medium text-gray-800">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-[9px] sm:text-xs uppercase tracking-wider">
                Total
              </span>
              <span className="font-medium text-gray-800">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>

          </div>

          {/* RIGHT: Order ID + STATUS BADGE */}
          <div className="text-right">
            <div className="text-[9px] sm:text-xs text-gray-400">
              #{order._id.slice(-6).toUpperCase()}
            </div>

            <span
              className={`
                inline-block px-2 py-0.5 mt-1 rounded-full 
                text-[8px] sm:text-[10px] font-bold uppercase
                ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }
              `}
            >
              {order.status}
            </span>
          </div>

        </div>

        {/* BODY */}
        <div className="p-3 sm:p-4">

          {order.products.map((p, i) => (
            <div key={i} className="flex gap-3 sm:gap-4 mb-3 sm:mb-4 last:mb-0">

              {/* IMAGE */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-md border overflow-hidden relative">
                {p.image ? (
                  <Image 
                    src={p.image} 
                    fill alt={p.name} 
                    className="object-cover"
                    sizes="(max-width: 640px) 64px, (max-width: 768px) 64px, 80px" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] sm:text-xs text-gray-400">
                    No Img
                  </div>
                )}
              </div>

              {/* PRODUCT INFO */}
              <div className="flex-1">
                <h4 className="font-semibold text-[10px] sm:text-base text-gray-800 line-clamp-1 group-hover:text-blue-600">
                  {p.name}
                </h4>
                <div className="text-[9px] sm:text-sm text-gray-600 mt-1">
                  Qty: {p.quantity}
                </div>
              </div>

            </div>
          ))}

          {/* FULL 4-STEP TIMELINE */}
          <div className="mt-3">
            {renderTimeline(order.status)}
          </div>

          {/* ACTION BUTTONS */}
          {showActions && (
            <div className="mt-4 border-t pt-3 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">

              {/* VIEW REQUEST */}
              {order.cancellationRequest ? (
                <button
                  onClick={(e) => onOpenRequestView(e, order)}
                  className="text-[9px] sm:text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded border border-orange-200"
                >
                  Cancellation {order.cancellationRequest.status}
                </button>
              ) : (
                <>
                  {/* CANCEL */}
                  {order.status === "Pending" && (
                    <button
                      onClick={(e) => onOpenCancel(e, order)}
                      className="text-[10px] sm:text-sm text-red-600 border border-red-200 px-4 py-1.5 rounded font-semibold hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* REQUEST CANCEL */}
                  {order.status === "Processing" && (
                    <button
                      onClick={(e) => onOpenCancel(e, order)}
                      className="text-[10px] sm:text-sm text-orange-600 border border-orange-200 px-4 py-1.5 rounded font-semibold hover:bg-orange-50"
                    >
                      Request Cancellation
                    </button>
                  )}
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </Link>
  );
}
