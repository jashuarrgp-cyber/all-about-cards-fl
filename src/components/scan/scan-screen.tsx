'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchScanCatalog, type ScanCatalogEntry } from '@/lib/scan/catalog';
import { formatUsd2 } from '@/lib/format';
import { SearchIcon } from '@/components/app/icons';

// Card scan flow: camera view with a capture frame, match the card, keep a
// running session with quantities and a market total, then review the batch.
// Automatic recognition requires a licensed recognition/pricing service (a
// later phase) — until then, capture and match by tapping. The scan session
// lives on this screen only; writing to inventory arrives with the receiving
// phase so inventory rules (cost basis, locations) are respected.

type Stage = 'scan' | 'identify' | 'review';

interface ScanItem {
  entry: ScanCatalogEntry;
  quantity: number;
}

export function ScanScreen() {
  const [stage, setStage] = useState<Stage>('scan');
  const [cameraOn, setCameraOn] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ScanItem[]>([]);
  const [lastAdded, setLastAdded] = useState<ScanCatalogEntry | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraOn(false);
    }
  }, []);

  useEffect(() => {
    if (stage === 'scan' && !streamRef.current) void startCamera();
  }, [stage, startCamera]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.entry.marketPrice * item.quantity,
        0,
      ),
    [items],
  );
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const addEntry = useCallback((entry: ScanCatalogEntry) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.entry.id === entry.id);
      if (existing) {
        return prev.map((item) =>
          item.entry.id === entry.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { entry, quantity: 1 }];
    });
    setLastAdded(entry);
    setQuery('');
    setStage('scan');
  }, []);

  const changeQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.entry.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.entry.id !== id));
  }, []);

  const results = useMemo(() => searchScanCatalog(query), [query]);

  return (
    <div className="flex flex-col gap-4 pb-6 pt-5">
      {stage !== 'review' && (
        <>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
            {cameraOn ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center bg-base-800">
                <p className="max-w-52 text-center text-sm text-slate-400">
                  Camera not available — match cards below instead.
                </p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-5 rounded-2xl border-2 border-brand-green/80" />
            {cameraOn && (
              <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-medium text-white/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                Fill frame with card, then tap to scan
              </p>
            )}
            <button
              type="button"
              onClick={() => setStage('identify')}
              className="absolute bottom-4 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-white/90 bg-white/25 backdrop-blur"
              aria-label="Scan card"
            />
          </div>

          <p className="text-center text-[11px] text-slate-500">
            Tap the shutter, then match the card. Automatic recognition plugs in
            here once a licensed card-recognition service is connected.
          </p>

          <div className="flex items-center justify-between rounded-3xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <div>
              <div className="text-xs text-slate-500">
                Total{' '}
                <span className="text-[10px] uppercase text-slate-600">
                  (sample prices)
                </span>
              </div>
              <div className="text-xl font-bold tabular-nums text-white">
                {formatUsd2(total)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStage('review')}
              disabled={count === 0}
              className="rounded-full bg-brand-teal px-5 py-2.5 text-sm font-bold text-base-950 disabled:opacity-40"
            >
              Review {count} →
            </button>
          </div>

          {lastAdded && stage === 'scan' && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
              <span
                className="h-12 w-9 shrink-0 rounded-md"
                style={{ backgroundColor: lastAdded.accentColor }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  {lastAdded.name}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {lastAdded.cardNumber} · {lastAdded.setName}
                </div>
              </div>
              <div className="text-sm font-bold tabular-nums text-white">
                {formatUsd2(lastAdded.marketPrice)}
              </div>
            </div>
          )}
        </>
      )}

      {stage === 'identify' && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md rounded-t-3xl border-t border-white/10 bg-base-900 p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Match the card</h2>
            <button
              type="button"
              onClick={() => setStage('scan')}
              className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-slate-300"
            >
              Cancel
            </button>
          </div>
          <label className="mt-3 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
            <SearchIcon
              className="h-5 w-5 shrink-0 text-slate-500"
              aria-hidden
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, number, or set"
              className="w-full bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
              aria-label="Search cards to match"
            />
          </label>
          <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {results.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => addEntry(entry)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-left"
                >
                  <span
                    className="h-12 w-9 shrink-0 rounded-md"
                    style={{ backgroundColor: entry.accentColor }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">
                      {entry.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {entry.cardNumber} · {entry.setName}
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums text-white">
                    {formatUsd2(entry.marketPrice)}
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="py-8 text-center text-sm text-slate-500">
                No matches — try another name or number.
              </li>
            )}
          </ul>
        </div>
      )}

      {stage === 'review' && (
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStage('scan')}
              className="text-sm text-slate-400"
            >
              ← Back
            </button>
            <h1 className="text-lg font-bold text-white">Review scans</h1>
            <span className="w-12" />
          </div>

          <ul className="mt-4 space-y-3">
            {items.map(({ entry, quantity }) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3"
              >
                <span
                  className="h-14 w-10 shrink-0 rounded-md"
                  style={{ backgroundColor: entry.accentColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">
                    {entry.name}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {entry.cardNumber} · {entry.setName}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold tabular-nums text-slate-300">
                    MKT {formatUsd2(entry.marketPrice)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQuantity(entry.id, -1)}
                    aria-label={`Remove one ${entry.name}`}
                    className="h-8 w-8 rounded-full bg-white/[0.06] font-bold text-slate-300"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold tabular-nums text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(entry.id, 1)}
                    aria-label={`Add one ${entry.name}`}
                    className="h-8 w-8 rounded-full bg-white/[0.06] font-bold text-slate-300"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(entry.id)}
                  aria-label={`Remove ${entry.name}`}
                  className="ml-1 text-slate-500"
                >
                  ✕
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="py-10 text-center text-sm text-slate-500">
                Nothing scanned yet.
              </li>
            )}
          </ul>

          <div className="mt-5 flex items-center justify-between rounded-3xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <div>
              <div className="text-xs text-slate-500">Items</div>
              <div className="text-lg font-bold tabular-nums text-white">
                {count}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                Market total{' '}
                <span className="text-[10px] uppercase text-slate-600">
                  (sample)
                </span>
              </div>
              <div className="text-lg font-bold tabular-nums text-white">
                {formatUsd2(total)}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-500">
            Scan session only — one-tap saving into inventory (with cost and
            location) arrives with the receiving phase.
          </p>

          <button
            type="button"
            onClick={() => setStage('scan')}
            className="mt-4 w-full rounded-2xl bg-brand-teal py-3.5 text-[15px] font-bold text-base-950"
          >
            Keep scanning
          </button>
        </div>
      )}
    </div>
  );
}
