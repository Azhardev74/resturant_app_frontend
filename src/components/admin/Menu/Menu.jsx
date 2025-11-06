/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import MenuFilter from "../Filter/MenuFilter";
import { useMenu } from "./Hooks/useMenu";
import MenuItemCard from "./Components/MenuItemCard";
import AddItemModal from "./Components/AddItemModal";
import NotificationModal from "./Components/NotificationModal";
import DeleteConfirmModal from "./Components/DeleteConfirmModal";
import EditItemModal from "./components/EditItemModal";
import Heading from "../ui/Heading";

const Menu = () => {
  const {
    items,
    restaurantCategories,
    loading,
    error,
    loadingCategories,
    errorCategories,
    addItem,
    updateItem,
    deleteItem,
  } = useMenu();

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    type: "all",
    available: "all",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => (prev.show ? { ...prev, show: false } : prev));
    }, 3000);
  }, []);

  const closeNotification = useCallback(() => {
    setNotification({ show: false, message: "", type: "" });
  }, []);

  const handleFilterChange = (newFilters) => setFilters(newFilters);

  const filteredItems = useMemo(() => {
    const searchLower = filters.search.toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !searchLower ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.category && item.category.toLowerCase().includes(searchLower));

      const matchesCategory =
        filters.category === "all" || item.category === filters.category;

      const matchesType = filters.type === "all" || item.type === filters.type;

      const matchesAvailability =
        filters.available === "all" ||
        item.available.toString() === filters.available;

      return (
        matchesSearch && matchesCategory && matchesType && matchesAvailability
      );
    });
  }, [items, filters]);

  const handleAddItem = async (formData, file) => {
    try {
      await addItem(formData, file);
      showNotification("Item added successfully!", "success");
      setIsAddModalOpen(false);
    } catch (err) {
      showNotification(err.message || "Failed to add item", "error");
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      await updateItem(itemData);
      showNotification("Item updated successfully!", "success");
      setEditingItem(null);
    } catch (err) {
      showNotification(err.message || "Failed to update item", "error");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteItem(deleteConfirm.id);
      showNotification("Item deleted successfully!", "success");
      setDeleteConfirm(null);
    } catch (err) {
      showNotification(err.message || "Failed to delete item", "error");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 relative">
      <NotificationModal
        notification={notification}
        onClose={closeNotification}
      />
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        itemName={deleteConfirm?.name}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteItem}
      />
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
        restaurantCategories={restaurantCategories}
        loadingCategories={loadingCategories}
        errorCategories={errorCategories}
      />

      <AnimatePresence>
        {editingItem && (
          <EditItemModal
            item={editingItem}
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onSubmit={handleUpdateItem}
            restaurantCategories={restaurantCategories}
          />
        )}
      </AnimatePresence>

      <div>
        <div>
          <Heading title={"Menu Management"} />
        </div>

        <div className="fixed bottom-10 right-6 z-20">
          <Button
            variant="outline"
            className="bg-green-600 rounded-full text-white hover:bg-green-800 h-16 w-16"
            onClick={() => setIsAddModalOpen(true)}
          >
            <CirclePlus size={20} />
          </Button>
        </div>

        <div className="my-6">
          <MenuFilter
            value={filters}
            onFilterChange={handleFilterChange}
            categories={restaurantCategories}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => setDeleteConfirm({ id: item._id, name: item.name })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-700">No Items Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;