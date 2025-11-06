/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import config from "../../../../config"

export const useMenu = () => {
    const [items, setItems] = useState([]);
    const [restaurantCategories, setRestaurantCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState(null);

    const API_URL = `${config.BASE_URL}/api/menu`;
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(API_URL, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(
                    errData.message || `Failed to fetch menu (Status: ${res.status})`
                );
            }
            const data = await res.json();
            const menuData = data.menu || data;
            if (Array.isArray(menuData)) {
                setItems(menuData);
            } else {
                setError("Unexpected API response format");
            }
        } catch (err) {
            setError(err.message || "Failed to load menu");
        } finally {
            setLoading(false);
        }
    }, [API_URL, token]);

    const fetchRestaurantCategories = useCallback(async () => {
        if (!token) {
            setErrorCategories("Not logged in.");
            setLoadingCategories(false);
            return;
        }
        try {
            setLoadingCategories(true);
            setErrorCategories(null);
            const res = await fetch(`${config.BASE_URL}/api/restaurant/admin`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch restaurant categories");
            const data = await res.json();
            if (data.restaurant && Array.isArray(data.restaurant.categories)) {
                setRestaurantCategories([...data.restaurant.categories].sort());
            } else {
                setRestaurantCategories([]);
            }
        } catch (err) {
            setErrorCategories(`Could not load categories: ${err.message}`);
        } finally {
            setLoadingCategories(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMenu();
        fetchRestaurantCategories();
    }, [fetchMenu, fetchRestaurantCategories]);


    const addItem = async (addFormData, addFile) => {
        if (!token) {
            throw new Error("Please login to add products");
        }
        if (!addFormData.category) {
            throw new Error("Please select a category");
        }
        if (!addFile) {
            throw new Error("Please select a product image");
        }

        const { pricingType, price, variantRates } = addFormData;
        if (pricingType === "single" && (!price || parseFloat(price) <= 0)) {
            throw new Error("Please enter a valid single price");
        }

        if (pricingType === "variant") {
            const { quarter, half, full } = variantRates;
            const hasAtLeastOneVariant =
                (quarter && parseFloat(quarter) > 0) ||
                (half && parseFloat(half) > 0) ||
                (full && parseFloat(full) > 0);

            if (!hasAtLeastOneVariant) {
                throw new Error(
                    "Please enter at least one valid variant price (Quarter, Half, or Full)"
                );
            }
        }

        const formData = new FormData();
        formData.append("name", addFormData.name.trim());
        formData.append("description", addFormData.description.trim());
        formData.append("category", addFormData.category);
        if (addFormData.type) formData.append("type", addFormData.type);
        formData.append("available", addFormData.available);
        formData.append("file", addFile);

        formData.append("pricingType", addFormData.pricingType);
        if (addFormData.pricingType === "single") {
            formData.append("price", addFormData.price);
        } else {
            if (addFormData.variantRates.quarter) {
                formData.append(
                    "variantRates[quarter]",
                    addFormData.variantRates.quarter
                );
            }
            if (addFormData.variantRates.half) {
                formData.append("variantRates[half]", addFormData.variantRates.half);
            }
            if (addFormData.variantRates.full) {
                formData.append("variantRates[full]", addFormData.variantRates.full);
            }
        }

        const res = await fetch(`${config.BASE_URL}/api/menu/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(result?.message || `API Error (${res.status})`);
        }

        const newItem = result.item || result;
        setItems((prev) => [newItem, ...prev]);
        return newItem;
    };

    const updateItem = async (editingItem) => {
        if (!editingItem) throw new Error("No item selected for editing.");

        if (!editingItem.category) {
            throw new Error("Please select a category for the item.");
        }

        const { pricingType, price, variantRates } = editingItem;
        const effectivePricingType = pricingType || "single";

        if (
            effectivePricingType === "single" &&
            (!price || parseFloat(price) <= 0)
        ) {
            throw new Error("Please enter a valid single price");
        }

        if (effectivePricingType === "variant") {
            const { quarter, half, full } = variantRates || {};
            const hasAtLeastOneVariant =
                (quarter && parseFloat(quarter) > 0) ||
                (half && parseFloat(half) > 0) ||
                (full && parseFloat(full) > 0);

            if (!hasAtLeastOneVariant) {
                throw new Error("Please enter at least one valid variant price");
            }
        }

        let body;
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        if (editingItem.image instanceof File) {
            body = new FormData();
            body.append("name", editingItem.name);
            body.append("category", editingItem.category);
            if (editingItem.type) body.append("type", editingItem.type);
            body.append("description", editingItem.description);
            body.append("available", editingItem.available);
            body.append("file", editingItem.image);
            body.append("pricingType", effectivePricingType);
        } else {
            headers["Content-Type"] = "application/json";
            const { image, ...itemData } = editingItem;
            body = JSON.stringify(itemData);
        }

        const res = await fetch(`${API_URL}/${editingItem._id}`, {
            method: "PUT",
            headers,
            body,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to update item");

        const updatedItem = data.item || data;
        setItems((prev) =>
            prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
        );
        return updatedItem;
    };

    const deleteItem = async (id) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) throw new Error("Failed to delete item");

        setItems((prev) => prev.filter((i) => i._id !== id));
        return true;
    };

    return {
        items,
        restaurantCategories,
        loading,
        error,
        loadingCategories,
        errorCategories,
        addItem,
        updateItem,
        deleteItem,
    };
};