"use client";

import { useMemo, useState } from "react";
import FormModal from "@/components/FormModal";

export default function Home() {
  // Modal open/close
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // 3D Print Modal Form
  const [printForm, setPrintForm] = useState({
    requestName: "",
    requestEmail: "",
    printFile: null as File | null,
    printQuantity: "1",
    filamentColor: "",
    comments: "",
  });

  // Reset 3d Print Form
  const reset3DPrintForm = () => {
    setPrintForm({
      requestName: "",
      requestEmail: "",
      printFile: null,
      printQuantity: "1",
      filamentColor: "",
      comments: "",
    });
  };

  // Close 3D Print Modal
  const close3DPrintModal = () => {
    setPrintModalOpen(false);
    reset3DPrintForm();
  };

  // Check that user entered a valid email
  const isEmailValid = useMemo(() => {
    const v = printForm.requestEmail.trim();
    return v.includes("@") && v.includes(".");
  }, [printForm.requestEmail]);

  // ensure quantity is a whole number greater than 0
  const qtyRaw = printForm.printQuantity.trim();
  const qtyNum = Number(qtyRaw);
  const hasQty = qtyRaw.length > 0;
  const isQtyNumber = hasQty && Number.isFinite(qtyNum);
  const isQtyInteger = isQtyNumber && Number.isInteger(qtyNum);
  const isQtyAtLeastOne = isQtyNumber && qtyNum >= 1;
  const isQuantityValid = isQtyInteger && isQtyAtLeastOne;

  // Required fields gate
  const isSubmitDisabled =
    !printForm.requestName.trim() ||
    !isEmailValid ||
    !printForm.printFile ||
    !isQuantityValid ||
    !printForm.filamentColor.trim();

  const handle3DPrintSubmit = async () => {
    if (isSubmitDisabled) return;

    setSaving(true);
    try {
      // Placeholder for now
      console.log("3D Print Request", {
        name: printForm.requestName.trim(),
        email: printForm.requestEmail.trim(),
        file: printForm.printFile?.name,
        quantity: Number(printForm.printQuantity),
        filamentColor: printForm.filamentColor.trim(),
        comments: printForm.comments.trim(),
      });

      close3DPrintModal();
    } finally {
      setSaving(false);
    }
  };

  // 3D Print errors
  const errors = {
    requestEmail:
      !printForm.requestEmail.trim() || isEmailValid
        ? ""
        : "Enter a valid email.",
    printQuantity: !hasQty
      ? ""
      : !isQtyNumber
        ? "Enter a number."
        : !isQtyInteger
          ? "Enter a whole number."
          : !isQtyAtLeastOne
            ? "Enter a quantity of 1 or more."
            : "",
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
        <FormModal
          open={printModalOpen}
          onClose={close3DPrintModal}
          onSubmit={handle3DPrintSubmit}
          title="New 3D Print Request"
          size="lg"
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={isSubmitDisabled}
          values={printForm}
          setValues={setPrintForm}
          errors={errors}
          fields={[
            {
              key: "requestName",
              label: "Name",
              required: true,
            },
            {
              key: "requestEmail",
              label: "Email",
              required: true,
              type: "email",
            },

            // Custom file picker
            {
              kind: "custom",
              key: "printFile",
              colSpan: 2,
              render: () => (
                <div className="text-left">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Print File *
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    We accept .stl, .3mf, .stp
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                      Choose file
                      <input
                        type="file"
                        className="hidden"
                        accept=".stl,.3mf,.stp"
                        onChange={(e) =>
                          setPrintForm((p) => ({
                            ...p,
                            printFile: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </label>

                    <div className="text-sm text-gray-700 truncate max-w-[22rem]">
                      {printForm.printFile ? (
                        printForm.printFile.name
                      ) : (
                        <span className="text-gray-400">No file selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },

            {
              key: "printQuantity",
              label: "Print Quantity",
              required: true,
              type: "number",
            },
            {
              key: "filamentColor",
              label: "Filament Color (1st choice)",
              required: true,
            },
            {
              kind: "custom",
              key: "comments",
              colSpan: 2,
              render: () => (
                <div className="text-left">
                  {/* Explanation Lines */}
                  <div className="mt-2 text-xs font-medium text-gray-600">
                    <p>3D Prints cost $0.10 per gram.</p>
                    <p className="mt-1.5">Infill set to 15%</p>
                  </div>

                  <label className="block text-sm font-medium text-byu-navy mt-5 mb-1">
                    Additional Comments
                  </label>

                  <p className="mt-0.5 text-xs text-gray-500 mb-2">
                    Use this to note any special settings (layer height,
                    supports, orientation, etc). Most prints will work with our
                    default settings.
                  </p>

                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    placeholder="Optional notes..."
                    value={printForm.comments}
                    onChange={(e) =>
                      setPrintForm((p) => ({
                        ...p,
                        comments: e.target.value,
                      }))
                    }
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}
