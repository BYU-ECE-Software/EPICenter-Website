"use client";

import { useMemo, useState } from "react";
import { formatCents } from "@/lib/utils/money";
import { useCart } from "@/app/providers/CartProvider";
import PrimaryButton from "@/components/PrimaryButton";
import CartRowCard from "@/components/CartRowCard";
import FormModal from "@/components/FormModal";
import { FiCornerUpLeft, FiPlus } from "react-icons/fi";
import type { Item } from "@/types/item";

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`text-sm ${
          strong ? "font-semibold text-byu-navy" : "text-gray-600"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          strong ? "font-semibold text-byu-navy" : "text-gray-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function CartPage() {
  const { items, setQty, removeItem, subtotalCents } = useCart();

  const inc = (itemId: number, currentQty: number) =>
    setQty(itemId, currentQty + 1);
  const dec = (itemId: number, currentQty: number) =>
    setQty(itemId, Math.max(1, currentQty - 1));

  // Add Misc Purchase State
  const [miscOpen, setMiscOpen] = useState(false);
  const { addItem } = useCart();
  const [miscForm, setMiscForm] = useState({
    itemName: "",
    price: "", // dollars, user entered
    qty: "1", // keep as string for easy typing; validate on submit
  });

  // Open Add Misc Modal
  const openMisc = () => {
    setMiscForm({ itemName: "", price: "", qty: "1" });
    setMiscOpen(true);
  };

  // On Close Misc Modal
  const closeMisc = () => {
    setMiscOpen(false);
    setMiscForm({ itemName: "", price: "", qty: "1" });
  };

  const miscQtyNumber = Number(miscForm.qty);
  const miscPriceNumber = Number(miscForm.price);

  // Validate Misc Modal inputs
  const isMiscQtyValid = Number.isInteger(miscQtyNumber) && miscQtyNumber > 0;
  const isMiscPriceValid =
    Number.isFinite(miscPriceNumber) && miscPriceNumber > 0;
  const isMiscNameValid = miscForm.itemName.trim().length > 0;

  // Disable Misc Modal Submission until all inputs are valid
  const miscSubmitDisabled =
    !isMiscNameValid || !isMiscPriceValid || !isMiscQtyValid;

  // Add Misc Item to Cart
  const submitMisc = () => {
    if (miscSubmitDisabled) return;

    const cents = Math.round(miscPriceNumber * 100);

    // Make a temporary "misc" item (unique id so it doesn't merge with others)
    const miscItem: Item = {
      id: Date.now(), // unique enough for now
      name: miscForm.itemName.trim(),
      description: "Misc Item",
      priceCents: cents,
      photoURL: "miscItem.png",
      // Anything else your Item type requires can be added here with defaults
    } as Item;

    addItem(miscItem, miscQtyNumber);
    closeMisc();
  };

  // Refund modal + state
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: "" }); // dollars
  const [refundCents, setRefundCents] = useState(0);

  // Open Refund Modal
  const openRefund = () => {
    // Prefill with existing refund if present
    setRefundForm({
      amount: refundCents ? (refundCents / 100).toFixed(2) : "",
    });
    setRefundOpen(true);
  };

  // On Close Refund Modal
  const closeRefund = () => {
    setRefundOpen(false);
    setRefundForm({ amount: "" });
  };

  // Clear Refund
  const clearRefund = () => {
    setRefundCents(0);
    setRefundForm({ amount: "" });
    setRefundOpen(false);
  };

  //Validate Refund Amount
  const refundAmountNumber = Number(refundForm.amount);
  const isRefundValid =
    Number.isFinite(refundAmountNumber) && refundAmountNumber > 0;

  // Add Refund to Checkout Summary. Replace any existing refund with newest one
  const submitRefund = () => {
    if (!isRefundValid) return;
    const cents = Math.round(refundAmountNumber * 100);

    setRefundCents(cents);

    closeRefund();
  };

  // Calculate Checkout total
  const totalCents = subtotalCents - refundCents;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">Cart</h1>

      <div className="max-w-none mt-8">
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: items */}
          <section className="lg:col-span-7 space-y-4">
            {/* Add Misc Purchase Button */}
            <div className="flex items-center justify-between">
              <PrimaryButton
                label="Add Misc Item to Cart"
                icon={<FiPlus className="w-4 h-4" />}
                className="text-sm"
                onClick={openMisc}
              />
            </div>

            {items.length ? (
              items.map((item, idx) => (
                <CartRowCard
                  key={item.itemId}
                  showHeader={idx === 0}
                  id={item.itemId}
                  name={item.name}
                  description={item.description}
                  priceCents={item.priceCents}
                  qty={item.qty}
                  photoURL={item.photoURL}
                  onInc={() => inc(item.itemId, item.qty)}
                  onDec={() => dec(item.itemId, item.qty)}
                  onRemove={() => removeItem(item.itemId)}
                />
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <div className="text-byu-navy font-semibold">
                  Your cart is empty
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Once you add items, they’ll show up here.
                </div>
              </div>
            )}
          </section>

          {/* RIGHT: summary */}
          <aside className="lg:col-span-3 lg:col-start-9">
            <div className="sticky top-24 space-y-3">
              {/* Summary card */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="text-sm font-semibold text-byu-navy">
                    Total
                  </div>
                </div>

                <div className="px-5 py-4 space-y-3">
                  <SummaryRow
                    label="Sub-total"
                    value={formatCents(subtotalCents)}
                  />
                  <SummaryRow
                    label="Refunds"
                    value={refundCents ? `(${formatCents(refundCents)})` : "0"}
                  />

                  <div className="pt-2 border-t border-gray-100" />
                  <SummaryRow
                    label="Total"
                    value={formatCents(totalCents)}
                    strong
                  />

                  <PrimaryButton
                    label="Check Out"
                    className="mt-3 w-full justify-center py-2.5 text-sm font-semibold"
                    disabled={!items.length}
                    onClick={() => console.log("checkout")}
                  />
                </div>
              </div>

              {/* Refund button OUTSIDE the card */}
              <div className="flex justify-end">
                <PrimaryButton
                  label={refundCents ? "Change refund amount" : "Issue refund"}
                  icon={<FiCornerUpLeft className="h-4 w-4" />}
                  className="px-3 py-1.5 text-xs font-medium justify-center w-full"
                  bgClass="bg-white text-byu-royal border border-byu-royal"
                  hoverBgClass="hover:bg-blue-50"
                  onClick={openRefund}
                />
              </div>
              {refundCents ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearRefund}
                    className="text-xs text-gray-500 hover:text-gray-700 hover:underline self-end"
                  >
                    Remove refund
                  </button>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {/* Add Misc Purchase Modal */}
      <FormModal
        open={miscOpen}
        onClose={closeMisc}
        onSubmit={submitMisc}
        title="Add Misc Item"
        size="sm"
        saving={false}
        saveLabel="Add to Cart"
        submitDisabled={miscSubmitDisabled}
        values={miscForm}
        setValues={setMiscForm}
        fields={[
          {
            key: "itemName",
            label: "Item Name",
            required: true,
            colSpan: 2,
          },
          {
            key: "price",
            label: "Price",
            required: true,
            type: "number",
            placeholder: "0.00",
            adornment: { text: "$", position: "start" },
          },
          {
            key: "qty",
            label: "Quantity",
            required: true,
            type: "number",
            placeholder: "1",
          },
        ]}
      />

      {/* Issue Refund Modal */}
      <FormModal
        open={refundOpen}
        onClose={closeRefund}
        onSubmit={submitRefund}
        title={refundCents ? "Change refund amount" : "Issue refund"}
        size="sm"
        saving={false}
        saveLabel={refundCents ? "Update" : "Confirm"}
        submitDisabled={!isRefundValid}
        values={refundForm}
        setValues={setRefundForm}
        fields={[
          {
            key: "amount",
            label: "Amount to refund",
            required: true,
            type: "number",
            placeholder: "0.00",
            adornment: { text: "$", position: "start" },
            colSpan: 2,
          },
        ]}
      />
    </main>
  );
}
