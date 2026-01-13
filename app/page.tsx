"use client";

import { useMemo, useState } from "react";
import BaseModal from "@/components/BaseModal";

export default function Home() {
  // Modal open/close
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Section 1: Request Information
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");

  // Section 2: Print File
  const [printFile, setPrintFile] = useState<File | null>(null);

  // Section 3: Print Settings
  const [printQuantity, setPrintQuantity] = useState("1");
  const [filamentColor, setFilamentColor] = useState("");
  const [infillPercent, setInfillPercent] = useState("");
  const [comments, setComments] = useState("");

  const reset3DPrintForm = () => {
    setRequestName("");
    setRequestEmail("");
    setPrintFile(null);
    setPrintQuantity("1");
    setFilamentColor("");
    setInfillPercent("");
    setComments("");
  };

  const close3DPrintModal = () => {
    setPrintModalOpen(false);
    reset3DPrintForm();
  };

  const isEmailValid = useMemo(() => {
    const v = requestEmail.trim();
    return v.includes("@") && v.includes(".");
  }, [requestEmail]);

  const quantityNumber = Number(printQuantity);
  const infillNumber = Number(infillPercent);

  const isQuantityValid =
    Number.isInteger(quantityNumber) &&
    Number.isFinite(quantityNumber) &&
    quantityNumber > 0;

  const isInfillValid =
    Number.isInteger(infillNumber) &&
    Number.isFinite(infillNumber) &&
    infillNumber >= 5 &&
    infillNumber <= 15;

  // Required fields gate
  const isSubmitDisabled =
    !requestName.trim() ||
    !isEmailValid ||
    !printFile ||
    !isQuantityValid ||
    !filamentColor.trim() ||
    !isInfillValid;

  const handle3DPrintSubmit = async () => {
    if (isSubmitDisabled) return;

    setSaving(true);
    try {
      // Placeholder for now
      console.log("3D Print Request", {
        name: requestName.trim(),
        email: requestEmail.trim(),
        file: printFile?.name,
        quantity: Number(printQuantity),
        filamentColor: filamentColor.trim(),
        infillPercent: Number(infillPercent),
        comments: comments.trim(),
      });

      close3DPrintModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-byu-royal/5 via-white to-byu-navy/5 flex items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        {/* Little badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-byu-navy text-white text-xs tracking-wide uppercase mb-4">
          <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
          Under construction
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-byu-navy tracking-tight">
          Welcome to the <span className="text-byu-royal">EPICenter</span> ⚡
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
          This will be the home for ECE shop orders, inventory, and other
          engineering goodies. For now, it&apos;s basically a very fancy
          &quot;Coming Soon&quot; page while we plug in all the wires.
        </p>

        {/* Silly status line */}
        <div className="mt-6 text-xs sm:text-sm text-gray-600">
          <p>Current status: ⚙️ calibrating flux capacitors…</p>
          <p className="mt-1 italic">
            If you&apos;re seeing this, the engineers are still tinkering.
          </p>
        </div>

        {/* Request buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            className="px-5 py-3 rounded-md border border-byu-royal text-byu-royal bg-white hover:bg-byu-royal hover:text-white transition text-sm font-medium"
            onClick={() => setPrintModalOpen(true)}
          >
            3D Print Request
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-md border border-byu-royal text-byu-royal bg-white hover:bg-byu-royal hover:text-white transition text-sm font-medium"
          >
            PCB Mill Request
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-md border border-byu-royal text-byu-royal bg-white hover:bg-byu-royal hover:text-white transition text-sm font-medium"
          >
            Laser Cut Request
          </button>
        </div>

        {/* 3D Print Request Modal */}
        <BaseModal
          open={printModalOpen}
          onClose={close3DPrintModal}
          onSubmit={handle3DPrintSubmit}
          title="New 3D Print Request"
          size="lg"
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={isSubmitDisabled}
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Request Info Section */}
            <section className="text-left">
              <h3 className="text-base font-semibold text-byu-navy mb-4">
                Request Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    placeholder="Enter your name..."
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    placeholder="name@byu.edu"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                  />
                  {!requestEmail.trim() || isEmailValid ? null : (
                    <p className="mt-1 text-xs text-red-600">
                      Enter a valid email.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section divider */}
            <div className="border-t border-gray-200" />

            {/* Print File Section */}
            <section className="text-left">
              <h3 className="text-base font-semibold text-byu-navy mb-2">
                Print File
              </h3>

              <p className="text-xs text-gray-600 mb-3">
                We accept .stl, .3mf, .stp
              </p>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    accept=".stl,.3mf,.stp"
                    onChange={(e) => setPrintFile(e.target.files?.[0] ?? null)}
                  />
                </label>

                <div className="text-sm text-gray-700 truncate max-w-[22rem]">
                  {printFile ? (
                    printFile.name
                  ) : (
                    <span className="text-gray-400">No file selected</span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs font-medium text-gray-600">
                3D Prints cost $0.10 per gram
              </p>
            </section>

            {/* Section divider */}
            <div className="border-t border-gray-200" />

            {/* Print Settings Section */}
            <section className="text-left">
              <h3 className="text-base font-semibold text-byu-navy mb-4">
                Print Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Print Quantity */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Print Quantity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    value={printQuantity}
                    onChange={(e) => setPrintQuantity(e.target.value)}
                  />
                  {!printQuantity || isQuantityValid ? null : (
                    <p className="mt-1 text-xs text-red-600">
                      Enter a quantity of 1 or more.
                    </p>
                  )}
                </div>

                {/* Infill */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Infill (Between 5–15) *
                  </label>

                  <div className="relative">
                    {/* % suffix */}
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>

                    <input
                      type="number"
                      min={5}
                      max={15}
                      step={1}
                      className="w-full rounded-md border border-gray-300 pr-8 pl-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                      value={infillPercent}
                      onChange={(e) => setInfillPercent(e.target.value)}
                    />
                  </div>

                  {!infillPercent || isInfillValid ? null : (
                    <p className="mt-1 text-xs text-red-600">
                      Infill must be between 5 and 15.
                    </p>
                  )}
                </div>

                {/* Filament Color */}
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Filament Color (1st choice) *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    placeholder="e.g., Black"
                    value={filamentColor}
                    onChange={(e) => setFilamentColor(e.target.value)}
                  />
                </div>

                {/* Additional Comments */}
                <div className="md:col-span-12">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Additional Comments
                  </label>

                  <p className="mb-2 text-xs text-gray-600">
                    Use this to note any special settings (layer height, speed,
                    supports, orientation, etc). Most prints will work with our
                    default settings.
                  </p>

                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    placeholder="Optional notes..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>
        </BaseModal>
      </div>
    </main>
  );
}
