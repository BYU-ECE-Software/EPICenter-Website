"use client";

import { useMemo, useState } from "react";
import { formatCents } from "@/lib/utils/money";
import { useCart } from "@/app/providers/CartProvider";
import PrimaryButton from "@/components/PrimaryButton";
import CartRowCard from "@/components/CartRowCard";
import FormModal from "@/components/FormModal";
import ConfirmModal from "@/components/ConfirmModal";
import { fetchUserById } from "@/lib/api/usersApi";
import { verifyManagerApproval } from "@/lib/api/managerApprovalApi";
import type { User } from "@/types/user";
import { FiCornerUpLeft, FiPlus, FiCheckCircle } from "react-icons/fi";
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
  const {
    items,
    setQty,
    removeItem,
    addItem,
    subtotalCents,
    refundCents,
    setRefundCents,
    clearRefund,
  } = useCart();

  const inc = (itemId: number, currentQty: number) =>
    setQty(itemId, currentQty + 1);
  const dec = (itemId: number, currentQty: number) =>
    setQty(itemId, Math.max(1, currentQty - 1));

  // Add Misc Purchase State
  const [miscOpen, setMiscOpen] = useState(false);
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
  const clearRefundClick = () => {
    clearRefund();
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

  // Checkout Modal State
  const totalCents = subtotalCents - refundCents;
  type CheckoutStep = "entry" | "managerApproval" | "confirm";
  type PurchaseType = "individual" | "group";
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("entry");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Stores the values the user enters in the checkout modal
  const [checkoutForm, setCheckoutForm] = useState({
    purchaseType: "individual" as PurchaseType,
    userId: "", // regular DB user id for now
    // later: groupId: ""
  });

  // Stores the user we pull from the backend
  const [checkoutUser, setCheckoutUser] = useState<User | null>(null);

  // Opens the checkout modal and resets everything to default
  const openCheckout = () => {
    setCheckoutError(null);
    setCheckoutUser(null);
    setCheckoutStep("entry");
    setCheckoutForm({ purchaseType: "individual", userId: "" });

    setCheckoutOpen(true);
  };

  // Closes the checkout modal and clears all state
  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutLoading(false);
    setCheckoutError(null);
    setCheckoutUser(null);
    setCheckoutStep("entry");
    setCheckoutForm({ purchaseType: "individual", userId: "" });
  };

  // Checks that the user id looks valid before continuing
  const isUserIdValid = useMemo(() => {
    const v = checkoutForm.userId.trim();
    return v.length > 0 && /^[0-9]+$/.test(v);
  }, [checkoutForm.userId]);

  // Disables Continue until we have a valid id and aren't loading
  const checkoutEntryDisabled = !isUserIdValid || checkoutLoading;

  // Step 1 submit: fetch the user and move to the confirmation screen
  const submitCheckoutEntry = async () => {
    if (checkoutEntryDisabled) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const userId = Number(checkoutForm.userId.trim());
      const user = await fetchUserById(userId);

      // Save user
      setCheckoutUser(user);
      // If refund is large, require manager approval before confirmation screen
      if (needsManagerApproval) {
        setManagerError(null);
        setManagerForm({ pin: "" });
        setCheckoutStep("managerApproval");
      } else {
        setCheckoutStep("confirm");
      }
    } catch (e: any) {
      // If lookup fails, show an error message
      setCheckoutError(e?.message || "Could not find a user with that ID.");
      setCheckoutUser(null);
    } finally {
      // Stop the loading spinner no matter what happens
      setCheckoutLoading(false);
    }
  };

  // Takes user back to the first checkout screen
  const backToCheckoutEntry = () => {
    setCheckoutError(null);
    setCheckoutUser(null);
    setCheckoutStep("entry");
  };

  // Step 2 submit: finalize the checkout (for now just logs the payload)
  const submitCheckoutConfirm = () => {
    // Build the data we would eventually send to the backend
    const payload = {
      purchaseType: checkoutForm.purchaseType,
      userId: checkoutForm.userId.trim(),
      totalCents,
      refundCents,
      items,
      // later: groupId
    };

    // No charge yet, so just log for now
    console.log("CHECKOUT CONFIRMED (no charge yet):", payload);

    // Close the modal after confirming
    closeCheckout();
  };

  // Manager Modal State
  const [managerForm, setManagerForm] = useState({ pin: "" });
  const [managerError, setManagerError] = useState<string | null>(null);
  const thresholdCents =
    Number(process.env.NEXT_PUBLIC_MANAGER_REFUND_THRESHOLD_CENTS) || 1000;
  const needsManagerApproval = refundCents >= thresholdCents;

  // Call backend to check if the input pin matches the manager pin
  const submitManagerApproval = async () => {
    setCheckoutLoading(true);
    setManagerError(null);

    try {
      await verifyManagerApproval(managerForm.pin);
      setCheckoutStep("confirm");
    } catch (e: any) {
      setManagerError(e?.message || "Manager approval failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };

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
                    disabled={!items.length && refundCents <= 0}
                    onClick={openCheckout}
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
                    onClick={clearRefundClick}
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

      {/* Checkout Modal - Step 1 (Entry) */}
      <FormModal
        open={checkoutOpen && checkoutStep === "entry"}
        onClose={closeCheckout}
        onSubmit={submitCheckoutEntry}
        title="Check Out"
        size="sm"
        saving={checkoutLoading}
        saveLabel="Continue"
        submitDisabled={checkoutEntryDisabled}
        values={checkoutForm}
        setValues={setCheckoutForm}
        fields={[
          {
            kind: "custom",
            key: "purchaseType",
            colSpan: 2,
            render: () => (
              <div className="text-left">
                <label className="block text-sm font-medium text-byu-navy mb-2">
                  Who is this purchase for?
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutForm((p) => ({
                        ...p,
                        purchaseType: "individual",
                      }))
                    }
                    className={`rounded-md border px-3 py-2 text-sm font-medium cursor-pointer ${
                      checkoutForm.purchaseType === "individual"
                        ? "border-byu-navy text-byu-navy bg-blue-50"
                        : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Individual
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutForm((p) => ({
                        ...p,
                        purchaseType: "group",
                      }))
                    }
                    className={`rounded-md border px-3 py-2 text-sm font-medium cursor-pointer ${
                      checkoutForm.purchaseType === "group"
                        ? "border-byu-navy text-byu-navy bg-blue-50"
                        : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Group
                  </button>
                </div>

                {checkoutForm.purchaseType === "group" ? (
                  <div className="mt-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                    Group dropdown will go here (next step).
                  </div>
                ) : null}

                {checkoutError ? (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {checkoutError}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            key: "userId",
            label: "User ID",
            required: true,
            colSpan: 2,
            placeholder: "Enter a valid 9 digit BYU ID",
          },
        ]}
      />

      {/* Checkout Modal - Step 1.5 (Return Approval if over Certain Threshold) */}
      <FormModal
        open={checkoutOpen && checkoutStep === "managerApproval"}
        onClose={closeCheckout}
        onSubmit={submitManagerApproval}
        title="Manager Approval Required"
        size="sm"
        saving={checkoutLoading}
        saveLabel="Approve"
        submitDisabled={!managerForm.pin.trim() || checkoutLoading}
        values={managerForm}
        setValues={setManagerForm}
        fields={[
          {
            kind: "custom",
            key: "managerText",
            colSpan: 2,
            render: () => (
              <div className="text-left">
                <div className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="mt-2 mr-1 items-center flex h-9 w-15 justify-center rounded-full bg-byu-royal/10 text-byu-royal">
                      <FiCheckCircle className="h-7 w-7" />
                    </div>

                    <div>
                      <p className="font-semibold text-byu-navy">
                        Manager approval required
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Refunds over{" "}
                        <span className="font-semibold text-byu-navy">
                          {formatCents(thresholdCents)}
                        </span>{" "}
                        require shop manager approval before checkout can
                        continue.
                      </p>
                    </div>
                  </div>
                </div>

                {managerError ? (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {managerError}
                  </div>
                ) : null}
                <div className=" mt-2 border-t border-gray-200 flex items-center justify-between"></div>
              </div>
            ),
          },
          {
            key: "pin",
            label: "Manager Approval Code",
            required: true,
            type: "pin",
            colSpan: 2,
          },
        ]}
      />

      {/* Checkout Modal - Step 2 (Checkout Confirmation) */}
      <ConfirmModal
        open={checkoutOpen && checkoutStep === "confirm"}
        title="Confirm Purchase"
        confirmLabel="Checkout"
        cancelLabel="Cancel"
        variant="primary"
        busy={checkoutLoading}
        onCancel={closeCheckout}
        onConfirm={submitCheckoutConfirm}
      >
        <div className="space-y-4 text-sm text-gray-700">
          {/* User info summary */}
          <p className="text-base font-semibold text-byu-navy">
            Purchaser Information
          </p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-byu-navy">
                  {checkoutUser?.name ?? ""}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Net ID:{" "}
                  <span className="font-medium text-gray-700">
                    {checkoutUser?.netID ?? ""}
                  </span>
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  BYU ID:{" "}
                  <span className="font-medium text-gray-700">
                    {checkoutUser?.byuID ?? ""}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            {/* Only show breakdown if there's a refund */}
            {refundCents > 0 ? (
              <div className="space-y-1 mb-4">
                {subtotalCents > 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Sub-total
                    </span>
                    <span className="text-gray-700">
                      {formatCents(subtotalCents)}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Refund
                  </span>
                  <span className="font-semibold text-red-600">
                    −{formatCents(refundCents)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Total row */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total
              </div>
              <div className="text-xl font-bold text-byu-navy">
                {formatCents(totalCents)}
              </div>
            </div>
          </div>
        </div>
      </ConfirmModal>
    </main>
  );
}
