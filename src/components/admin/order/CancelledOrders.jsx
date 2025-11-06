/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import OrdersTable from "./OrdersTable";
import EditOrderModal from "./EditOrderModal";
import DeleteModal from "./DeleteModal";
import ItemsModal from "./ItemsModal";
import config from "../../../config";
import Heading from "../ui/Heading";

const CancelledOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // 1. Add state for restaurant details
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  const [token] = useState(() => localStorage.getItem("token") || "");
  const API_URL = `${config.BASE_URL}/api/order`;
  const tableType = "cancelled";

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      2000
    );
  };
  const closeNotification = () =>
    setNotification({ show: false, message: "", type: "" });

  // Wrapped in useCallback
  const fetchOrders = useCallback(async () => {
    if (!token) return; // Guard clause
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.reverse());
    } catch (err) {
      setError(err.message);
      showNotification("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]); // Added dependencies

  const fetchMenuItems = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${config.BASE_URL}/api/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch menu items");
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : data.menu || data.data || []);
    } catch (err) {
      if (token) showNotification("Failed to fetch menu items", "error");
      setMenuItems([]);
    }
  }, [token]);

  // 2. Add function to fetch restaurant details


  const fetchRestaurantDetails = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${config.BASE_URL}/api/restaurant/admin`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch restaurant details");
      const data = await res.json();
      if (data.restaurant) {
        setRestaurantDetails(data.restaurant);
      } else {
        throw new Error("Restaurant data not found in response");
      }
    } catch (err) {
      console.error(err);
      showNotification("Could not load restaurant details for bills", "error");
    }
  }, [token]);

  const updateOrder = async (orderId, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update order");
      fetchOrders();
      setEditingOrder(null);
      showNotification("Order updated successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete order");
      fetchOrders();
      setShowConfirmDelete(null);
      showNotification("Order deleted successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  // Cleaned up useEffect
  useEffect(() => {
    if (!token) {
      setLoading(false);
      showNotification("No token found. Please login first", "error");
      return;
    }

    fetchOrders();
    fetchMenuItems();
    fetchRestaurantDetails(); // Call the new function
  }, [token, fetchOrders, fetchMenuItems, fetchRestaurantDetails]); // Add dependencies

  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  return (
    <div className="min-h-screen  px-4 py-6 sm:px-6 lg:px-8 relative">
      {/* ... (Notification Modal remains the same) ... */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeNotification}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              className={`relative rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-auto ${notification.type === "success"
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
                  : "bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${notification.type === "success"
                      ? "bg-green-100 text-green-600 border-2 border-green-200"
                      : "bg-red-100 text-red-600 border-2 border-red-200"
                    }`}
                >
                  {notification.type === "success" ? (
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                {/* FIX 1: Added `className` prop and some matching styles.
                 */}
                <h3
                  className={`text-2xl font-bold mb-4 ${notification.type === "success"
                      ? "text-green-900"
                      : "text-red-900"
                    }`}
                >
                  {notification.type === "success" ? "Success!" : "Oops!"}
                </h3>
                <p
                  className={`text-xl mb-8 leading-relaxed ${notification.type === "success"
                      ? "text-green-700"
                      : "text-red-700"
                    }`}
                >
                  {notification.message}
                  {/* FIX 2: Removed extra 's' and '</div>' from here.
                   */}
                </p>
                <motion.button
                  onClick={closeNotification}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full py-5 rounded-2xl text-xl font-bold shadow-lg transition-all ${
                    /* FIX 3: Removed stray 'C' and 'Â' characters from this template literal.
                     */
                    notification.type === "success"
                      ? "bg-green-500 text-white hover:bg-green-600 shadow-green-200"
                      : "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                    }`}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <div className="mb-4">
          <Heading title={"Cancelled Orders"} />
        </div>
        <OrdersTable
          orders={cancelledOrders}
          loading={loading}
          error={error}
          setEditingOrder={setEditingOrder}
          setShowConfirmDelete={setShowConfirmDelete}
          // 3. FIX: Pass the correct prop name (Your comment was correct)
          setOrderForBillModal={setSelectedItems}
          updateOrder={updateOrder}
          tableType={tableType}
        />
      </div>

      {/* 4. Pass restaurantDetails to the modal */}
      {selectedItems && (
        <ItemsModal
          order={selectedItems}
          restaurantDetails={restaurantDetails} // Pass details
          onClose={() => setSelectedItems(null)}
        />
      )}
      {editingOrder && (
        <EditOrderModal
          editingOrder={editingOrder}
          setEditingOrder={setEditingOrder}
          updateOrder={updateOrder}
          menuItems={menuItems}
        />
      )}
      {showConfirmDelete && (
        <DeleteModal
          order={showConfirmDelete}
          onCancel={() => setShowConfirmDelete(null)}
          onDelete={() => deleteOrder(showConfirmDelete._id)}
        />
      )}
    </div>
  );
};

export default CancelledOrders;
