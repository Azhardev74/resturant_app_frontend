// utils.js

// Returns badge colors based on status
export const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Recalculate total amount (if you need it in EditOrderModal)
export const recalcTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
