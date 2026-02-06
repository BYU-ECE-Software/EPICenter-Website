"use client";

import { formatCents } from "@/lib/utils/money";

type Props = {
  id: number;
  name: string;
  description?: string | null;
  priceCents: number;
  qty: number;
  photoURL?: string | null;

  onInc?: () => void;
  onDec?: () => void;
  onRemove?: () => void;

  showQuantityControls?: boolean;
  showHeader?: boolean;
};

export default function CartRowCard({
  id,
  name,
  description,
  priceCents,
  qty,
  photoURL,
  onInc,
  onDec,
  onRemove,
  showQuantityControls = true,
  showHeader = false,
}: Props) {
  const lineTotal = priceCents * qty;

  const imageSrc =
    photoURL === "miscItem.png"
      ? "/miscItem.png" // in /public
      : photoURL && id
        ? `/api/items/${id}/photo?v=${encodeURIComponent(photoURL)}`
        : null;

  // Desktop: more even spacing (details gets 2 shares, qty/total get 1 share each)
  // Underscores turn into spaces in Tailwind arbitrary values.
  const desktopCols =
    "md:[grid-template-columns:64px_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_44px]";

  return (
    <div className="w-full">
      {/* Header row ABOVE the card (desktop only) */}
      {showHeader ? (
        <div
          className={`hidden md:grid ${desktopCols} items-center gap-x-4 px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide`}
        >
          <div className="col-span-2 text-left">Product Details</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Subtotal</div>
          <div />
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* MOBILE layout */}
        <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-3 p-4 md:hidden">
          {/* Image */}
          <div className="h-16 w-16 overflow-hidden rounded-md">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-byu-navy">
              {name}
            </div>

            <div className="mt-0.5 text-xs text-gray-500 line-clamp-2">
              {description?.trim() ? description : "\u00A0"}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Unit price:{" "}
              <span className="font-medium text-byu-navy">
                {formatCents(priceCents)}
              </span>
            </div>
          </div>

          {/* Bottom row: Qty | Subtotal | X */}
          <div className="col-span-2 flex items-center justify-between gap-3 pt-1">
            {/* Quantity */}
            <div className="flex items-center">
              {showQuantityControls ? (
                <div className="inline-flex items-center rounded-md border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={onDec}
                    className="h-7 w-7 rounded-l-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={!onDec || qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <div className="flex h-7 w-9 items-center justify-center border-x border-gray-200 text-sm text-byu-navy">
                    {qty}
                  </div>

                  <button
                    type="button"
                    onClick={onInc}
                    className="h-7 w-7 rounded-r-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled={!onInc}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  Qty: <span className="font-medium text-byu-navy">{qty}</span>
                </div>
              )}
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <div className="text-xs text-gray-500">Subtotal</div>
              <div className="text-sm font-semibold text-byu-navy">
                {formatCents(lineTotal)}
              </div>
            </div>

            {/* Remove */}
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md p-2 text-gray-300 hover:text-gray-600 cursor-pointer"
                aria-label="Remove item"
                title="Remove"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        {/* DESKTOP layout */}
        <div
          className={`hidden md:grid ${desktopCols} items-center gap-x-4 p-4`}
        >
          {/* Image */}
          <div className="h-16 w-16 overflow-hidden rounded-md">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Name + description + unit price */}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-byu-navy">
              {name}
            </div>

            <div className="mt-0.5 text-xs text-gray-500 line-clamp-2">
              {description?.trim() ? description : "\u00A0"}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Unit price:{" "}
              <span className="font-medium text-byu-navy">
                {formatCents(priceCents)}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex justify-center">
            {showQuantityControls ? (
              <div className="inline-flex items-center rounded-md border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={onDec}
                  className="h-7 w-7 rounded-l-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={!onDec || qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <div className="flex h-7 w-9 items-center justify-center border-x border-gray-200 text-sm text-byu-navy">
                  {qty}
                </div>

                <button
                  type="button"
                  onClick={onInc}
                  className="h-7 w-7 rounded-r-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  disabled={!onInc}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Qty: <span className="font-medium text-byu-navy">{qty}</span>
              </div>
            )}
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <div className="text-sm font-semibold text-byu-navy">
              {formatCents(lineTotal)}
            </div>
          </div>

          {/* Remove */}
          <div className="flex justify-center">
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md p-2 text-gray-300 hover:text-gray-600 cursor-pointer"
                aria-label="Remove item"
                title="Remove"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
