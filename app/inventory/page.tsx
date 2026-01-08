"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import BaseModal from "@/components/BaseModal";
import Pagination from "@/components/Pagination";
import RowActionMenu from "@/components/RowActionMenu";
import ConfirmModal from "@/components/ConfirmModal";
import { useRole } from "../providers/RoleProvider";
import Toast, { type ToastType } from "@/components/Toast";
import {
  createItem,
  fetchItems,
  updateItem,
  deleteItem,
  uploadItemPhoto,
  type ItemPayload,
  type Item,
} from "../../lib/api/itemsApi";
import { formatCents } from "../../lib/utils/money";
import {
  FiPlus,
  FiShoppingCart,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";

// Get URL for Inventory Request Form from .env file
const INVENTORY_REQUEST_URL = process.env.NEXT_PUBLIC_INVENTORY_REQUEST_URL;

// Action Buttons that go in the last column of the data table.
function RowActions({
  row,
  onAddToCart,
  onEdit,
  onRemove,
}: {
  row: any;
  onAddToCart: (row: any) => void;
  onEdit: (row: any) => void;
  onRemove: (row: any) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {/* Add to Cart Button */}
      <button
        type="button"
        title="Add to cart"
        className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-2 py-2 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer"
        onClick={() => onAddToCart(row)}
      >
        <FiShoppingCart className="h-4 w-4" />
        <span>Add to Cart</span>
      </button>

      {/* Pop up with additional Edit and Remove options */}
      <RowActionMenu
        trigger={<FiMoreVertical className="h-4 w-4" />}
        items={[
          {
            label: "Edit",
            icon: <FiEdit2 className="h-4 w-4" />,
            onClick: () => onEdit(row),
          },
          {
            label: "Remove",
            icon: <FiTrash2 className="h-4 w-4" />,
            variant: "danger",
            onClick: () => onRemove(row),
          },
        ]}
      />
    </div>
  );
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // role state
  const { role } = useRole();
  const isEmployee = role === "employee";

  // Items from DB
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Item Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // State for fields in the Item Modal
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [initialPhotoUrl, setInitialPhotoUrl] = useState<string | null>(null);

  // Two modes for Item Modal - create or edit. different options for each
  type ItemModalMode = "create" | "edit";
  const [itemModalMode, setItemModalMode] = useState<ItemModalMode>("create");
  const [editingRow, setEditingRow] = useState<any>(null);
  const isEdit = itemModalMode === "edit";
  const modalTitle = isEdit ? "Edit Item" : "Create New Item";
  const modalSaveLabel = isEdit ? "Save Changes" : "Create Item";

  // Removing Item State
  const [removing, setRemoving] = useState(false);

  // Pagination state (placeholder for now)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = 5; // fake for now

  // Add-to-cart modal state
  const [addToCartOpen, setAddToCartOpen] = useState(false);
  const [cartQty, setCartQty] = useState("1");
  const [selectedCartRow, setSelectedCartRow] = useState<any>(null);

  // Load items for table once on page load
  useEffect(() => {
    const load = async () => {
      setItemsLoading(true);
      try {
        const data = await fetchItems();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setItemsLoading(false);
      }
    };

    load();
  }, []);

  // Add to Cart Handlers
  // Open Add to Cart Modal
  const openAddToCart = (row: any) => {
    setSelectedCartRow(row);
    setCartQty("1");
    setAddToCartOpen(true);
  };

  // Close add to Cart Modal
  const closeAddToCart = () => {
    setAddToCartOpen(false);
    setSelectedCartRow(null);
    setCartQty("1");
  };

  const qtyNumber = Number(cartQty);
  const isQtyValid = Number.isInteger(qtyNumber) && qtyNumber > 0;

  // Submit Add to Cart Modal
  const submitAddToCart = async () => {
    if (!isQtyValid) return;
    console.log("add to cart submit", {
      item: selectedCartRow,
      qty: qtyNumber,
    });
    closeAddToCart();
  };

  // Remove Item State
  const [removeOpen, setRemoveOpen] = useState(false);
  const [rowToRemove, setRowToRemove] = useState<any>(null);

  // Remove Item Hanlders
  // Open/close handlers
  const openRemoveConfirm = (row: any) => {
    setRowToRemove(row);
    setRemoveOpen(true);
  };

  const closeRemoveConfirm = () => {
    setRemoveOpen(false);
    setRowToRemove(null);
  };

  // Confirm Removal
  const confirmRemove = async () => {
    if (!rowToRemove?.id) return;

    setRemoving(true);
    try {
      await deleteItem(rowToRemove.id);

      // reload so table matches DB ordering, etc.
      const refreshed = await fetchItems();
      setItems(refreshed);

      closeRemoveConfirm();
      showToast(
        "success",
        "Item removed",
        `"${rowToRemove.name ?? "Item"}" was deleted.`
      );
    } catch (err) {
      console.error("Delete item failed:", err);
      showToast(
        "error",
        "Delete failed",
        "Could not remove the item. Try again."
      );
    } finally {
      setRemoving(false);
    }
  };

  // Columns for the Item Inventory Table
  const columns = [
    { key: "name", header: "Name" },
    {
      key: "photoURL",
      header: "",
      headerClassName: "w-[1%] whitespace-nowrap",
      render: (row: any) => {
        if (!row.photoURL) return null; // ✅ leave blank

        return (
          <div className="h-24 w-24 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/items/${row.id}/photo?v=${encodeURIComponent(
                row.photoURL
              )}`}
              alt={row.name ?? "Item photo"}
              className="h-full w-full object-contain"
              onError={(e) => {
                // if something goes wrong, hide it instead of showing broken image
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        );
      },
    },
    { key: "description", header: "Description" },
    { key: "location", header: "Location" },
    {
      key: "priceCents",
      header: "Price",
      render: (row: any) => formatCents(row.priceCents),
    },
    { key: "datasheet", header: "Datasheet" },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: any) => {
        if (!isEmployee) return null;

        return (
          <RowActions
            row={row}
            onAddToCart={openAddToCart}
            onEdit={openEditItem}
            onRemove={openRemoveConfirm}
          />
        );
      },
    },
  ];

  // Whether or not the Modal submission button should be disabled
  const isSubmitDisabled =
    !itemName.trim() ||
    !location.trim() ||
    !description.trim() ||
    price === "" ||
    Number(price) <= 0;

  // Reset Fields in the Item Form
  const resetItemForm = () => {
    setItemName("");
    setLocation("");
    setDescription("");
    setPrice("");
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setRemovePhoto(false);
    setInitialPhotoUrl(null);
  };

  // Fill Edit Item Modal with info from the row
  const fillItemFormFromRow = (row: any) => {
    setItemName(row?.name ?? "");
    setLocation(row?.location ?? "");
    setDescription(row?.description ?? "");

    const existingUrl =
      row?.id && row?.photoURL
        ? `/api/items/${row.id}/photo?v=${encodeURIComponent(row.photoURL)}`
        : null;

    setInitialPhotoUrl(existingUrl);
    setPhotoPreviewUrl(existingUrl);
    setRemovePhoto(false);
    setPhotoFile(null);

    const cents = row?.priceCents;
    if (cents === null || cents === undefined) {
      setPrice("");
    } else {
      setPrice((Number(cents) / 100).toFixed(2)); // input expects dollars
    }
  };

  // Open Item Modal in Create Mode
  const openCreateItem = () => {
    setItemModalMode("create");
    setEditingRow(null);
    resetItemForm();
    setItemModalOpen(true);
  };

  // Open Item Modal in Edit Mode
  const openEditItem = (row: any) => {
    setItemModalMode("edit");
    setEditingRow(row);
    fillItemFormFromRow(row);
    setItemModalOpen(true);
  };

  // Close the Item Form Modal
  const handleCloseItemModal = () => {
    resetItemForm();
    setEditingRow(null);
    setItemModalOpen(false);
    setItemModalMode("create");
  };

  // Submission of Create New Item Form
  const handleItemModalSubmit = async () => {
    setSaving(true);
    try {
      const priceNumber = parseFloat(price);

      // 1) Build the base payload (same as before)
      const payload: ItemPayload = {
        name: itemName.trim(),
        location: location.trim(),
        description: description.trim(),
        priceCents: Math.round(priceNumber * 100),
      };

      // 2) Decide what photoURL should be
      // - create mode: default null
      // - edit mode: default to existing key (preserve)
      let photoURLKey: string | null =
        itemModalMode === "edit" ? editingRow?.photoURL ?? null : null;

      // if user chose to remove the existing photo, force null
      if (removePhoto) {
        photoURLKey = null;
      }

      // 3) If user selected a new photo, upload it and replace the key
      if (photoFile) {
        const { key } = await uploadItemPhoto(photoFile);
        photoURLKey = key;
      }

      // 4) Save item with photoURL included
      if (itemModalMode === "create") {
        await createItem({ ...payload, photoURL: photoURLKey });
        const refreshed = await fetchItems();
        setItems(refreshed);
        showToast("success", "Item created", `"${payload.name}" was added.`);
      } else {
        if (!editingRow?.id) throw new Error("No item selected to edit");

        await updateItem(editingRow.id, {
          ...payload,
          photoURL: photoURLKey,
        });

        const refreshed = await fetchItems();
        setItems(refreshed);
        showToast("success", "Item updated", `"${payload.name}" was saved.`);
      }

      resetItemForm();
      setEditingRow(null);
      setItemModalMode("create");
      setItemModalOpen(false);
    } catch (err) {
      console.error("Item submit failed:", err);
      showToast("error", "Save failed", "Could not save the item. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Toast State
  const [toast, setToast] = useState<{
    type: ToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))]">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
            duration={4000}
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-byu-navy">Item Inventory</h1>

      {/* Search + actions row */}
      <div className="mt-6 mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Inventory Request Form - opens external link */}
        {INVENTORY_REQUEST_URL && (
          <Link
            href={INVENTORY_REQUEST_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PrimaryButton label="Go to Inventory Request Form" />
          </Link>
        )}

        {/* Right: Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items…"
          widthClass="w-full sm:w-80 md:w-96"
        />
      </div>

      {/* Create New Item Button */}
      {isEmployee && (
        <div className="mb-3">
          <PrimaryButton
            label="Create New Item"
            icon={<FiPlus className="w-4 h-4" />}
            bgClass="bg-white text-byu-royal"
            hoverBgClass="hover:bg-gray-50"
            className="border border-byu-royal text-sm"
            onClick={openCreateItem}
          />
        </div>
      )}

      <div>
        <DataTable data={items} loading={itemsLoading} columns={columns} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />

      {/* Create/Edit Item Form Modal */}
      <BaseModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSubmit={handleItemModalSubmit}
        title={modalTitle}
        size="lg"
        saving={saving}
        saveLabel={modalSaveLabel}
        submitDisabled={isSubmitDisabled}
      >
        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Item Name *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Enter item name..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Location *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Description *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Photo (optional) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-byu-navy mb-2">
              Image
            </label>

            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                {photoPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreviewUrl}
                    alt="Item photo preview"
                    className="h-full w-full object-cover"
                    onError={() => setPhotoPreviewUrl(null)}
                  />
                ) : (
                  <span className="text-xs text-gray-400 px-2 text-center">
                    No image selected
                  </span>
                )}
              </div>

              {/* Right side controls */}
              <div className="flex-1">
                <div className="flex flex-col items-start gap-2">
                  {/* Button that triggers the hidden input via label */}
                  <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                    {photoPreviewUrl ? "Change file" : "Choose file"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setPhotoFile(f);
                        setRemovePhoto(false);

                        if (f) {
                          setPhotoPreviewUrl(URL.createObjectURL(f));
                        } else {
                          setPhotoPreviewUrl(initialPhotoUrl);
                        }
                      }}
                    />
                  </label>

                  {(photoFile ||
                    (isEdit && editingRow?.photoURL && !removePhoto)) && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                      onClick={() => {
                        // If there is a newly selected file, just clear it (doesn't delete DB photo)
                        if (photoFile) {
                          setPhotoFile(null);

                          // If they had previously removed the existing photo, stay at "no image"
                          // Otherwise revert to the original DB photo (if any)
                          setPhotoPreviewUrl(
                            removePhoto ? null : initialPhotoUrl
                          );

                          return;
                        }

                        // Otherwise, we're removing the EXISTING saved photo
                        setRemovePhoto(true);
                        setPhotoFile(null);
                        setPhotoPreviewUrl(null);
                      }}
                    >
                      <FiTrash2 className="h-3 w-3" />
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Datasheet (optional) */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Datasheet
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Datasheet URL..."
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Price *
            </label>
            <div className="relative">
              {/* $ prefix */}
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                $
              </span>

              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Add to Cart Modal */}
      <BaseModal
        open={addToCartOpen}
        onClose={closeAddToCart}
        onSubmit={submitAddToCart}
        title="Enter item quantity"
        size="sm"
        saving={false}
        saveLabel="Add"
        submitDisabled={!isQtyValid}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-byu-navy">
            Quantity
          </label>

          <input
            type="number"
            step="1"
            min="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
            value={cartQty}
            onChange={(e) => setCartQty(e.target.value)} // allows delete/retype
          />
        </div>
      </BaseModal>

      {/* Confirm Removal of an Item */}
      <ConfirmModal
        open={removeOpen}
        title="Remove item?"
        message={
          rowToRemove?.name
            ? `Are you sure you want to remove "${rowToRemove.name}"?`
            : "Are you sure you want to remove this item?"
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        busy={removing}
        busyLabel="Removing…"
        variant="primary"
        closeOnBackdrop={true}
        onCancel={closeRemoveConfirm}
        onConfirm={confirmRemove}
      />
    </main>
  );
}
