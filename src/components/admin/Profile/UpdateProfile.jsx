import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    category: "",
    tableNumbers: "",
    phoneNumber: "",
    publicId: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState(null);

  // ✅ Category suggestions saved in localStorage
  const [categorySuggestions, setCategorySuggestions] = useState(() => {
    const saved = localStorage.getItem("restaurantCategories");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Token from localStorage
  const [token] = useState(() => localStorage.getItem("token") || "");

  // ✅ Fetch restaurant details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          "https://restaurant-app-backend-mihf.onrender.com/api/restaurant/admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        if (res.ok && data.restaurant) {
          const r = data.restaurant;
          setRestaurantId(r._id);
          setRestaurantInfo(r); // ✅ Save full info
          setFormData({
            category: r.categories?.[0] || "",
            tableNumbers: r.tableNumbers || "",
            phoneNumber: r.phoneNumber || "",
            publicId: r.logo?.public_id || "",
          });
        }
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
      }
    };

    if (token) fetchDetails();
  }, [token]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // File handler
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("⚠️ No token found. Please login first.");
      return;
    }

    const newCategory = formData.category.trim();
    if (newCategory && !categorySuggestions.includes(newCategory)) {
      setCategorySuggestions((prev) => [...prev, newCategory]);
    }

    try {
      setLoading(true);

      const payload = {
        categories: [formData.category],
        tableNumbers: Number(formData.tableNumbers),
        phoneNumber: Number(formData.phoneNumber),
        logo: {
          url: file ? URL.createObjectURL(file) : restaurantInfo?.logo?.url,
          public_id: formData.publicId || restaurantInfo?.logo?.public_id,
        },
      };

      const res = await fetch(
        `https://restaurant-app-backend-mihf.onrender.com/api/restaurant/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to update restaurant");

      alert("✅ Restaurant updated successfully.");
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      {/* ✅ Info Card */}
      {restaurantInfo && (
        <div className="w-full max-w-3xl bg-black text-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            🍴 Restaurant Info
          </h3>
          {restaurantInfo.name && (
            <p className="text-lg font-bold text-gray-900 mb-2">
              {restaurantInfo.name}
            </p>
          )}
          <p>
            <strong>Category:</strong>{" "}
            {restaurantInfo.categories?.join(", ") || "N/A"}
          </p>
          <p>
            <strong>Tables:</strong> {restaurantInfo.tableNumbers || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {restaurantInfo.phoneNumber || "N/A"}
          </p>
          {restaurantInfo.logo?.url && (
            <img
              src={restaurantInfo.logo.url}
              alt="Logo"
              className="h-16 mt-3 rounded"
            />
          )}
        </div>
      )}

      {/* ✅ Update Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          🏨 Update Restaurant
        </h2>

        {/* Row 1: Category + Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              list="category-suggestions"
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="e.g. Indian, Chinese"
            />
            <datalist id="category-suggestions">
              {categorySuggestions.map((cat, idx) => (
                <option key={idx} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Table Numbers
            </label>
            <input
              type="number"
              name="tableNumbers"
              value={formData.tableNumbers}
              onChange={handleChange}
              required
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="e.g. 25"
            />
          </div>
        </div>

        {/* Row 2: Phone */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Phone Number
          </label>
          <input
            type="number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="e.g. 9876543210"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Logo</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border rounded-xl p-3 cursor-pointer"
          />
          {file && (
            <p className="text-sm text-gray-500 mt-2">Selected: {file.name}</p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-orange-500 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-orange-600 transition"
        >
          {loading ? "Updating..." : "Update Restaurant"}
        </motion.button>
      </motion.form>

      <div>
        <button type="submit">Delete Restaurant</button>
      </div>
    </div>
  );
};

export default UpdateProfile;
