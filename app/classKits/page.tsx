"use client";

import { useState } from "react";
import { IoInformationCircle } from "react-icons/io5";
import { MdChecklist, MdCheckCircle } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { FiChevronDown } from "react-icons/fi";

export default function ClassKitsPage() {
  const [expandedKit, setExpandedKit] = useState<string | null>(null);

  const ece240Items = [
    { name: "Wire stripper", quantity: 1 },
    { name: "Arduino Nano", quantity: 1 },
    { name: "Resistor kit", quantity: 1 },
    { name: "H-bridge", quantity: 1 },
    { name: "Breadboard", quantity: 1 },
    { name: "Geared DC motor", quantity: 2 },
    { name: "180 servo", quantity: 1 },
    { name: "Battery holder", quantity: 2 },
    { name: "10 uf cap", quantity: 2 },
    { name: "1 uf cap", quantity: 2 },
    { name: "0.1 uf cap", quantity: 2 },
    { name: "USB cable", quantity: 1 },
    { name: "Wheels", quantity: 2 },
    { name: "N95 mask", quantity: 1 },
    { name: "LM324 Op Amp", quantity: 1 },
    { name: "Push button", quantity: 5 },
    { name: "Solid core wire", quantity: "7 (2-red, 2-blk, 1 rest of colors)" },
    { name: "Ultra-sonic sensor", quantity: 1 },
    { name: "QSD2030 IR photodiode", quantity: 4 },
    { name: "Jumpers", quantity: 40 },
    { name: "Long jumper male/female", quantity: 5 },
    { name: "Tweezer", quantity: 1 },
    { name: "Blue LED", quantity: 1 },
    { name: "Red LED", quantity: 1 },
    { name: "PCB board for QSD2030", quantity: 1 },
    { name: "SPST switch power", quantity: 1 },
    { name: "2 Meg potentiometer", quantity: 1 },
    { name: "Alligator to alligator cable", quantity: 4 },
    { name: "Right angle header 5 pin", quantity: 1 },
    { name: "Zip tie", quantity: 6 },
    { name: "Foam board", quantity: 1 },
  ];

  const ece225Items = [
    { name: "Raspberry Pi Zero 2 W", quantity: 1 },
    { name: "128x128 1.44inch LCD display HAT", quantity: 1 },
    { name: "Camera Module", quantity: 1 },
    { name: "32 GB SD Card", quantity: 1 },
    { name: "Card Reader", quantity: 1 },
    { name: "3D Printed Case", quantity: 1 },
    { name: "Additional accessories to build kit", quantity: 1 },
  ];

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gray-50 px-6 py-8 sm:px-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-byu-navy">Class Kits</h1>
        <p className="mt-2 text-gray-600">
          Lab kits required for ECEn courses. Review contents carefully and
          verify upon receipt.
        </p>
      </div>

      {/* Important Information Banner */}
      <div className="mb-8 flex overflow-hidden rounded-lg border-2 border-byu-navy/10 bg-white shadow-lg">
        {/* Important Info Content */}
        <div className="w-[40%] border-l-4 border-byu-royal bg-gradient-to-br from-white to-gray-50/50 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-byu-royal">
              <IoInformationCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-byu-navy">
              Kit Verification Required
            </h3>
          </div>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-byu-navy/10 bg-byu-navy/5">
                <IoMdTime className="h-6 w-6 text-byu-navy" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-byu-navy">
                  Deadline: September 22nd
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Verify all kit contents against the provided checklist by this
                  date
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-byu-navy/10 bg-byu-navy/5">
                <MdCheckCircle className="h-6 w-6 text-byu-navy" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-byu-navy">
                  Inspect Upon Receipt
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Missing or broken parts cannot be replaced after the deadline
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="w-[60%] flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Kit image</p>
          </div>
        </div>
      </div>

      {/* Kits Grid */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* ECE 240/301 Kit */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          {/* Kit Header */}
          <div className="bg-gradient-to-r from-byu-navy to-byu-royal p-6 text-white">
            <h2 className="text-2xl font-bold">ECE 240 / ECE 301</h2>
            <p className="mt-1 text-sm text-blue-100">Lab Kit</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">$68.00</span>
              <span className="text-sm text-blue-100">total price*</span>
            </div>
          </div>

          {/* Kit Body */}
          <div className="p-6">
            {/* Optional Item */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Tackle Box (Optional)
                  </p>
                  <p className="text-sm text-gray-600">
                    Recommended for carrying your kit
                  </p>
                </div>
                <span className="text-lg font-semibold text-byu-navy">
                  $14.10
                </span>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() =>
                setExpandedKit(expandedKit === "ece240" ? null : "ece240")
              }
              className="mb-4 flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-left font-medium text-byu-navy transition-colors hover:bg-gray-200"
            >
              <span className="flex items-center gap-2">
                <MdChecklist className="h-5 w-5" />
                View Complete Kit Contents ({ece240Items.length} items)
              </span>
              <FiChevronDown
                className={`h-5 w-5 transition-transform ${expandedKit === "ece240" ? "rotate-180" : ""}`}
              />
            </button>

            {/* Items Table */}
            {expandedKit === "ece240" && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Item Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {ece240Items.map((item, index) => (
                        <tr
                          key={index}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-byu-navy">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-600">
              *Price and/or quantity may vary
            </p>
          </div>
        </div>

        {/* ECE 225 Kit */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          {/* Kit Header */}
          <div className="bg-gradient-to-r from-byu-royal to-byu-navy p-6 text-white">
            <h2 className="text-2xl font-bold">ECE 225</h2>
            <p className="mt-1 text-sm text-blue-100">Lab Kit</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">$75.00</span>
              <span className="text-sm text-blue-100">total price*</span>
            </div>
          </div>

          {/* Kit Body */}
          <div className="p-6">
            {/* Toggle Button */}
            <button
              onClick={() =>
                setExpandedKit(expandedKit === "ece225" ? null : "ece225")
              }
              className="mb-4 flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-left font-medium text-byu-navy transition-colors hover:bg-gray-200"
            >
              <span className="flex items-center gap-2">
                <MdChecklist className="h-5 w-5" />
                View Complete Kit Contents ({ece225Items.length} items)
              </span>
              <FiChevronDown
                className={`h-5 w-5 transition-transform ${expandedKit === "ece225" ? "rotate-180" : ""}`}
              />
            </button>

            {/* Items Table */}
            {expandedKit === "ece225" && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Item Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {ece225Items.map((item, index) => (
                        <tr
                          key={index}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-byu-navy">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-600">
              *Price and/or quantity may vary
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
