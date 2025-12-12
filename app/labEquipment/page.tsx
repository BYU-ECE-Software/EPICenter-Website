"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import { FiPlus } from "react-icons/fi";

export default function LabEquipmentPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Columns for the Item Inventory Table
  const columns = [
    { key: "name", header: "Name" },
    { key: "serialNumber", header: "Serial Number" },
    { key: "price", header: "Price" },
    { key: "location", header: "Last Seen Location" },
    { key: "comments", header: "Comments" },
    { key: "", header: "" },
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

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">Equipment Inventory</h1>

      {/* Search + actions row */}
      <div className="mt-6 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PrimaryButton
          label="Create New Equipment"
          icon={<FiPlus className="w-4 h-4" />}
          bgClass="bg-white text-byu-royal"
          hoverBgClass="hover:bg-gray-50"
          className="border border-byu-royal text-sm"
          onClick={() => {}}
        />

        {/* Right: Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search equipment…"
          widthClass="w-full sm:w-80 md:w-96"
        />
      </div>

      <div>
        <DataTable data={mockItems} loading={false} columns={columns} />
      </div>
    </main>
  );
}
