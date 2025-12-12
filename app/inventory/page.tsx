"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import BaseModal from "@/components/BaseModal";
import { createItem, type CreateItemPayload } from "../lib/itemsApi";
import {
  FiPlus,
  FiShoppingCart,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";

// Get URL for Inventory Request Form from .env file
const INVENTORY_REQUEST_URL = process.env.NEXT_PUBLIC_INVENTORY_REQUEST_URL;

function RowActions({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center justify-end gap-1">
      {/* Add to Cart: compact icon button */}
      <button
        type="button"
        title="Add to cart"
        className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-2 py-2 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer"
        onClick={() => console.log("add to cart", row)}
      >
        <FiShoppingCart className="h-4 w-4" />
        <span>Add to Cart</span>
      </button>

      {/* More menu */}
      <button
        type="button"
        title="More"
        className="inline-flex h-9 w-9 items-center justify-center  text-byu-navy transition cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-20"
        >
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-byu-navy hover:bg-byu-navy/10"
            onClick={() => {
              setOpen(false);
              console.log("edit", row);
            }}
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>

          <button
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              console.log("remove", row);
            }}
          >
            <FiTrash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Item Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // State for fields in the Item Modal
  const [itemName, setItemName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Columns for the Item Inventory Table
  const columns = [
    { key: "name", header: "Name" },
    { key: "photoURL", header: "" },
    { key: "description", header: "Description" },
    { key: "location", header: "Location" },
    { key: "priceCents", header: "Price" },
    { key: "datasheet", header: "Datasheet" },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: any) => <RowActions row={row} />,
    },
  ];

  const mockItems = [
    {
      id: 1,
      name: "Oscilloscope Probe",
      location: "Shelf A1",
    },
    {
      id: 2,
      name: "Resistor Kit",
      location: "Bin B3",
    },
  ];

  // Whether or not the Modal submission button should be disabled
  const isCreateDisabled =
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
  };

  // Close the Item Form Modal
  const handleCloseItemModal = () => {
    resetItemForm();
    setItemModalOpen(false);
  };

  // Submission of Create New Item Form
  const handleItemModalSubmit = async () => {
    setSaving(true);
    try {
      const priceNumber = parseFloat(price);

      const payload: CreateItemPayload = {
        name: itemName.trim(),
        location: location.trim(),
        description: description.trim(),
        priceCents: Math.round(priceNumber * 100),
      };

      const createdItem = await createItem(payload);

      //setItems((prev) => [...prev, createdItem]);
      resetItemForm();
      setItemModalOpen(false);
    } catch (err) {
      console.error("Create item failed:", err);
      // later: toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
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
      <div className="mb-3">
        <PrimaryButton
          label="Create New Item"
          icon={<FiPlus className="w-4 h-4" />}
          bgClass="bg-white text-byu-royal"
          hoverBgClass="hover:bg-gray-50"
          className="border border-byu-royal text-sm"
          onClick={() => setItemModalOpen(true)}
        />
      </div>

      <div>
        <DataTable data={mockItems} loading={false} columns={columns} />
      </div>

      {/* Create Item Form Modal */}
      <BaseModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSubmit={handleItemModalSubmit}
        title="Create New Item"
        size="lg"
        saving={saving}
        saveLabel="Create Item"
        submitDisabled={isCreateDisabled}
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

          {/* Image (optional) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Image
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Image URL..."
            />
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
    </main>
  );
}
