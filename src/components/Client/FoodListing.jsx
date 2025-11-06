"use client";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../features/cartSlice";
import { Dot } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

const groupByCategory = (items) => {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
};

export default function FoodListing({ menu, onQuantityChange }) {
  const groupedMenu = groupByCategory(menu || []);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items || {});
  const [descModal, setDescModal] = useState({ open: false, text: "" });

  useEffect(() => {
    if (onQuantityChange) {
      const total = Object.values(cartItems).reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      onQuantityChange(total);
    }
  }, [cartItems, onQuantityChange]);

  const increment = (item) => {
    dispatch(addToCart({ id: item._id, item }));
  };

  const decrement = (item) => {
    dispatch(removeFromCart(item._id));
  };

  const openDescription = (text) => {
    setDescModal({ open: true, text: text || "" });
  };

  const closeDescription = () => {
    setDescModal({ open: false, text: "" });
  };

  return (
    <div className="bg-gray-50 flex flex-col pb-20 px-3 pt-6">
      {Object.keys(groupedMenu).map((category) => (
        <div key={category} id={`category-${category}`} className="mb-10">
          {/* ✅ Category Header */}
          <div className="flex items-center gap-2 mb-4">
            <Dot className="text-primary" size={14} strokeWidth={24} />
            <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
              {category}
            </h2>
          </div>

          {/* ✅ Food Cards */}
          <div className="flex flex-col gap-5">
            {groupedMenu[category].map((item) => {
              const quantity = cartItems[item._id]?.quantity || 0;
              const isUnavailable = !item.available;
              // Description preview length set to 40 characters

              return (
                <div
                  key={item._id}
                  className={`flex items-start bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ring-1 ring-transparent hover:ring-primary/20 ${
                    isUnavailable ? "opacity-60 grayscale" : "opacity-100"
                  }`}
                >
                  {/* ✅ Image Section */}
                  <div className="relative w-40 h-32 flex-shrink-0 overflow-hidden rounded-l-2xl">
                    <img
                      src={item.image?.url}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
                    />
                    {/* Veg / Non-Veg dot badge over image */}
                    <div className="absolute top-2 left-2 backdrop-blur-sm bg-white/80 p-1 rounded-full shadow-sm border border-white/70">
                      {item.type === "veg" ? (
                        <Dot size={14} strokeWidth={12} className="border-2 border-green-700 text-green-700" />
                      ) : (
                        <Dot size={14} strokeWidth={12} className="border-2 border-red-600 text-red-600" />
                      )}
                    </div>
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
                        Not Available
                      </div>
                    )}
                  </div>

                  {/* ✅ Details Section */}
                  <div className="flex flex-col justify-between p-3 flex-1 min-h-32">
                    {/* Top Info */}
                    <div className="mb-1">
                      <h3 className="text-base font-semibold text-gray-900 leading-snug">
                        {item.name}
                      </h3>

                      {/* ✅ Description with preview and modal on Read more */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {(item.description || "").slice(0, 45)}
                        {(item.description || "").length > 45 && "…"}
                        {(item.description || "").length > 45 && (
                          <button
                            onClick={() => openDescription(item.description)}
                            className="ml-1 text-primary font-medium hover:underline"
                          >
                            Read more
                          </button>
                        )}
                      </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="flex justify-between items-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[13px] font-semibold border border-orange-200">
                        ₹{item.price}
                      </span>

                      {!isUnavailable && (
                        <div className="flex items-center gap-2">
                          {quantity > 0 ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => decrement(item)}
                                className="rounded-full h-8 w-8 p-0 text-lg font-bold border-gray-300 hover:border-gray-400"
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium min-w-[24px] text-center">
                                {quantity}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => increment(item)}
                                className="rounded-full h-8 w-8 p-0 text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-sm"
                              >
                                +
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => increment(item)}
                              className="rounded-full px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm"
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {/* Description Modal (tooltip-like) */}
      {descModal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeDescription}
        >
          <div
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">Description</h4>
              <button
                onClick={closeDescription}
                className="text-gray-500 hover:text-red-500"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="text-gray-700 text-sm leading-relaxed">
              {descModal.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
