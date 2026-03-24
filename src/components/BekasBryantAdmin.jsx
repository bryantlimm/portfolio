import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
//   deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";

// NOTE: If your firebase.js doesn't export `storage`, add:
//   import { getStorage } from "firebase/storage";
//   export const storage = getStorage(app);
// ...to your firebase.js file.

const CATEGORIES = [
  { id: "clothing", label: "Clothing", emoji: "👕" },
  { id: "shoes", label: "Shoes", emoji: "👟" },
  { id: "electronics", label: "Electronics", emoji: "📱" },
  { id: "stationery", label: "Stationery", emoji: "✏️" },
  { id: "books", label: "Books", emoji: "📚" },
  { id: "other", label: "Other", emoji: "📦" },
];

const EMPTY_FORM = {
  title: "",
  price: "",
  description: "",
  category: "clothing",
  active: true,
  images: [], // URLs already uploaded
};

function formatIDR(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function ProductFormModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product || EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(product?.images || []);
  const fileRef = useRef();
  const isEdit = !!product?.id;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removeImage = (idx) => {
    const isExisting = idx < (form.images?.length || 0);
    if (isExisting) {
      setForm((f) => ({
        ...f,
        images: f.images.filter((_, i) => i !== idx),
      }));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const newIdx = idx - (form.images?.length || 0);
      setNewImageFiles((prev) => prev.filter((_, i) => i !== newIdx));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.price) {
      alert("Title and price are required.");
      return;
    }
    setSaving(true);
    try {
      let uploadedUrls = [];

      // Upload new images to Firebase Storage
      if (newImageFiles.length > 0) {
        setUploading(true);
        uploadedUrls = await Promise.all(
          newImageFiles.map(async (file) => {
            const storageRef = ref(
              storage,
              `bekasbryant/${Date.now()}_${file.name}`
            );
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
        setUploading(false);
      }

      const finalImages = [...(form.images || []), ...uploadedUrls];

      const data = {
        title: form.title.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        category: form.category,
        active: form.active,
        images: finalImages,
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(db, "bekasbryant_products", product.id), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "bekasbryant_products"), data);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving product. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Images
            </label>
            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors text-xs gap-1"
              >
                <span className="text-2xl">+</span>
                <span>Add</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Product title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price (IDR) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="e.g. 150000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {form.price && (
              <p className="text-xs text-gray-400 mt-1">{formatIDR(form.price)}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    form.category === cat.id
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Size, condition, details..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Active</p>
              <p className="text-xs text-gray-400">Visible to buyers when active</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.active ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-60 transition"
            >
              {uploading ? "Uploading..." : saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BekasBryantAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(null); // null = closed, {} = new, {...} = edit
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "bekasbryant_products"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort: newest first
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (product) => {
    try {
      await updateDoc(doc(db, "bekasbryant_products", product.id), {
        active: !product.active,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, active: !p.active } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      await deleteDoc(doc(db, "bekasbryant_products", product.id));
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const openNew = () => {
    setModalProduct(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setModalProduct(product);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/bekasbryant.png"
            alt="Bekas Bryant"
            className="h-8 w-auto"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bekas Bryant</h2>
            <p className="text-xs text-gray-400">{products.length} products</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <span className="text-base">+</span> Add Product
        </button>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-20" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="font-medium">No products yet</p>
          <p className="text-sm">Click "Add Product" to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const cat = CATEGORIES.find((c) => c.id === product.category);
            const img = product.images?.[0] || null;
            return (
              <div
                key={product.id}
                className={`flex items-center gap-3 bg-white border rounded-2xl p-3 transition-opacity ${
                  !product.active ? "opacity-50" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {cat?.emoji || "📦"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{product.title}</p>
                  <p className="text-emerald-600 font-bold text-sm">{formatIDR(product.price)}</p>
                  <p className="text-xs text-gray-400">
                    {cat?.emoji} {cat?.label}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(product)}
                    title={product.active ? "Deactivate" : "Activate"}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      product.active ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        product.active ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(product)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deleting === product.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition disabled:opacity-50"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProductFormModal
          product={modalProduct}
          onClose={closeModal}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}