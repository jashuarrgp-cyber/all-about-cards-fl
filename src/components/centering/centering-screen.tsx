'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  centeringGuidance,
  computeSplits,
  detectCardEdges,
  toGrayImage,
  type CenteringResult,
} from '@/lib/centering/analysis';
import { ScanIcon } from '@/components/app/icons';

// AI Centering: capture a card with the camera (or upload a photo), detect
// the outer card edge and inner printed frame, show grader-style centering
// splits, and let the user fine-tune every line by hand. All analysis runs
// on-device — the photo never leaves the browser.

const ANALYSIS_MAX_WIDTH = 720;

type Stage = 'start' | 'camera' | 'adjust' | 'done';

type LineId =
  | 'outerLeft'
  | 'outerRight'
  | 'outerTop'
  | 'outerBottom'
  | 'innerLeft'
  | 'innerRight'
  | 'innerTop'
  | 'innerBottom';

const LINE_LABELS: Record<LineId, string> = {
  outerLeft: 'Card left',
  outerRight: 'Card right',
  outerTop: 'Card top',
  outerBottom: 'Card bottom',
  innerLeft: 'Frame left',
  innerRight: 'Frame right',
  innerTop: 'Frame top',
  innerBottom: 'Frame bottom',
};

function isVertical(line: LineId): boolean {
  return line.endsWith('Left') || line.endsWith('Right');
}

export function CenteringScreen() {
  const [stage, setStage] = useState<Stage>('start');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [rects, setRects] = useState<CenteringResult | null>(null);
  const [selected, setSelected] = useState<LineId>('outerLeft');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setStage('camera');
      // Attach after render.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraError('Camera not available — you can upload a photo instead.');
    }
  }, []);

  const analyzeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const gray = toGrayImage(data.data, canvas.width, canvas.height);
    setRects(detectCardEdges(gray));
    setSize({ w: canvas.width, h: canvas.height });
    setImageUrl(canvas.toDataURL('image/jpeg', 0.85));
    setSelected('outerLeft');
    setStage('adjust');
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const scale = Math.min(1, ANALYSIS_MAX_WIDTH / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas
      .getContext('2d')
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();
    analyzeCanvas(canvas);
  }, [analyzeCanvas, stopCamera]);

  const onUpload = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      // Data URL (not blob:) keeps the strict img-src CSP intact.
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, ANALYSIS_MAX_WIDTH / img.naturalWidth);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          canvas
            .getContext('2d')
            ?.drawImage(img, 0, 0, canvas.width, canvas.height);
          analyzeCanvas(canvas);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [analyzeCanvas],
  );

  const splits = useMemo(() => (rects ? computeSplits(rects) : null), [rects]);
  const guidance = useMemo(
    () => (splits ? centeringGuidance(splits) : null),
    [splits],
  );

  const moveSelected = useCallback(
    (imageCoord: number) => {
      if (!rects || !size) return;
      const value = Math.round(imageCoord);
      setRects((prev) => {
        if (!prev) return prev;
        const next: CenteringResult = {
          outer: { ...prev.outer },
          inner: { ...prev.inner },
        };
        const gap = 2;
        switch (selected) {
          case 'outerLeft':
            next.outer.left = clamp(value, 0, next.inner.left - gap);
            break;
          case 'innerLeft':
            next.inner.left = clamp(
              value,
              next.outer.left + gap,
              next.inner.right - gap,
            );
            break;
          case 'innerRight':
            next.inner.right = clamp(
              value,
              next.inner.left + gap,
              next.outer.right - gap,
            );
            break;
          case 'outerRight':
            next.outer.right = clamp(value, next.inner.right + gap, size.w - 1);
            break;
          case 'outerTop':
            next.outer.top = clamp(value, 0, next.inner.top - gap);
            break;
          case 'innerTop':
            next.inner.top = clamp(
              value,
              next.outer.top + gap,
              next.inner.bottom - gap,
            );
            break;
          case 'innerBottom':
            next.inner.bottom = clamp(
              value,
              next.inner.top + gap,
              next.outer.bottom - gap,
            );
            break;
          case 'outerBottom':
            next.outer.bottom = clamp(
              value,
              next.inner.bottom + gap,
              size.h - 1,
            );
            break;
        }
        return next;
      });
    },
    [rects, selected, size],
  );

  const nudge = useCallback(
    (delta: number) => {
      if (!rects) return;
      const current = lineCoord(rects, selected);
      moveSelected(current + delta);
    },
    [moveSelected, rects, selected],
  );

  const pointerToImageCoord = useCallback(
    (clientX: number, clientY: number): number | null => {
      const box = overlayRef.current?.getBoundingClientRect();
      if (!box || !size) return null;
      return isVertical(selected)
        ? ((clientX - box.left) / box.width) * size.w
        : ((clientY - box.top) / box.height) * size.h;
    },
    [selected, size],
  );

  const reset = useCallback(() => {
    stopCamera();
    setImageUrl(null);
    setRects(null);
    setSize(null);
    setCameraError(null);
    setStage('start');
  }, [stopCamera]);

  return (
    <div className="space-y-5 pb-6 pt-5">
      {stage === 'start' && (
        <div className="flex flex-col items-center py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand-pink">
            <ScanIcon />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">AI Centering</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Capture a card and we&apos;ll detect its borders and measure the
            centering. Everything runs on your device — the photo never leaves
            your phone.
          </p>
          {cameraError && (
            <p className="mt-3 max-w-xs text-xs text-amber-300">
              {cameraError}
            </p>
          )}
          <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
            <button
              type="button"
              onClick={startCamera}
              className="rounded-2xl bg-brand-pink py-3.5 text-[15px] font-bold text-base-950"
            >
              Use camera
            </button>
            <label className="cursor-pointer rounded-2xl border border-white/15 py-3.5 text-center text-[15px] font-semibold text-white">
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload a card photo"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      )}

      {stage === 'camera' && (
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-brand-green/80" />
            <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-medium text-white/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
              Fill the frame with the card
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-2xl border border-white/15 py-3.5 text-[15px] font-semibold text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capture}
              className="flex-[2] rounded-2xl bg-brand-pink py-3.5 text-[15px] font-bold text-base-950"
            >
              Capture
            </button>
          </div>
        </div>
      )}

      {(stage === 'adjust' || stage === 'done') &&
        imageUrl &&
        size &&
        rects &&
        splits &&
        guidance && (
          <div>
            <div
              ref={overlayRef}
              className="relative touch-none select-none overflow-hidden rounded-3xl border border-white/10 bg-black"
              onPointerDown={(e) => {
                if (stage !== 'adjust') return;
                draggingRef.current = true;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                const coord = pointerToImageCoord(e.clientX, e.clientY);
                if (coord !== null) moveSelected(coord);
              }}
              onPointerMove={(e) => {
                if (!draggingRef.current || stage !== 'adjust') return;
                const coord = pointerToImageCoord(e.clientX, e.clientY);
                if (coord !== null) moveSelected(coord);
              }}
              onPointerUp={() => {
                draggingRef.current = false;
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Captured card" className="w-full" />
              <svg
                viewBox={`0 0 ${size.w} ${size.h}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <Rect
                  rect={rects.outer}
                  color="#22d3b7"
                  selected={stage === 'adjust' ? selected : null}
                  prefix="outer"
                />
                <Rect
                  rect={rects.inner}
                  color="#f0a03c"
                  selected={stage === 'adjust' ? selected : null}
                  prefix="inner"
                />
              </svg>
              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                L/R {splits.leftRight[0]}/{splits.leftRight[1]} · T/B{' '}
                {splits.topBottom[0]}/{splits.topBottom[1]}
              </div>
            </div>

            {stage === 'adjust' ? (
              <>
                <p className="mt-4 text-center text-xs text-slate-500">
                  Select a line, then drag on the photo or use the arrows. Teal
                  = card edge, amber = printed frame.
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {(Object.keys(LINE_LABELS) as LineId[]).map((line) => (
                    <button
                      key={line}
                      type="button"
                      onClick={() => setSelected(line)}
                      aria-pressed={selected === line}
                      className={`rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
                        selected === line
                          ? 'bg-white text-base-950'
                          : 'bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      {LINE_LABELS[line]}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => nudge(-1)}
                    aria-label={`Move ${LINE_LABELS[selected]} ${isVertical(selected) ? 'left' : 'up'}`}
                    className="h-12 w-16 rounded-2xl border border-white/15 text-lg font-bold text-white"
                  >
                    {isVertical(selected) ? '←' : '↑'}
                  </button>
                  <span className="min-w-24 text-center text-xs text-slate-400">
                    {LINE_LABELS[selected]}
                  </span>
                  <button
                    type="button"
                    onClick={() => nudge(1)}
                    aria-label={`Move ${LINE_LABELS[selected]} ${isVertical(selected) ? 'right' : 'down'}`}
                    className="h-12 w-16 rounded-2xl border border-white/15 text-lg font-bold text-white"
                  >
                    {isVertical(selected) ? '→' : '↓'}
                  </button>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex-1 rounded-2xl border border-white/15 py-3.5 text-[15px] font-semibold text-white"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('done')}
                    className="flex-[2] rounded-2xl bg-brand-pink py-3.5 text-[15px] font-bold text-base-950"
                  >
                    Confirm centering
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-3xl border border-white/5 bg-white/[0.03] p-5 text-center">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Centering result
                </div>
                <div className="mt-3 flex items-center justify-center gap-6">
                  <div>
                    <div className="text-3xl font-bold tabular-nums text-white">
                      {splits.leftRight[0]}/{splits.leftRight[1]}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Left / Right
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tabular-nums text-white">
                      {splits.topBottom[0]}/{splits.topBottom[1]}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Top / Bottom
                    </div>
                  </div>
                </div>
                <div className="mt-4 inline-block rounded-full bg-brand-pink/15 px-4 py-1.5 text-sm font-semibold text-brand-pink">
                  {guidance.label}
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  Approximate, front centering only. Real grades also weigh
                  corners, edges, and surface.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStage('adjust')}
                    className="flex-1 rounded-2xl border border-white/15 py-3 text-sm font-semibold text-white"
                  >
                    Adjust again
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="flex-1 rounded-2xl bg-brand-pink py-3 text-sm font-bold text-base-950"
                  >
                    Analyze another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lineCoord(rects: CenteringResult, line: LineId): number {
  switch (line) {
    case 'outerLeft':
      return rects.outer.left;
    case 'outerRight':
      return rects.outer.right;
    case 'outerTop':
      return rects.outer.top;
    case 'outerBottom':
      return rects.outer.bottom;
    case 'innerLeft':
      return rects.inner.left;
    case 'innerRight':
      return rects.inner.right;
    case 'innerTop':
      return rects.inner.top;
    case 'innerBottom':
      return rects.inner.bottom;
  }
}

function Rect({
  rect,
  color,
  selected,
  prefix,
}: {
  rect: { left: number; right: number; top: number; bottom: number };
  color: string;
  selected: string | null;
  prefix: 'outer' | 'inner';
}) {
  const lines: {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[] = [
    {
      id: `${prefix}Left`,
      x1: rect.left,
      y1: rect.top,
      x2: rect.left,
      y2: rect.bottom,
    },
    {
      id: `${prefix}Right`,
      x1: rect.right,
      y1: rect.top,
      x2: rect.right,
      y2: rect.bottom,
    },
    {
      id: `${prefix}Top`,
      x1: rect.left,
      y1: rect.top,
      x2: rect.right,
      y2: rect.top,
    },
    {
      id: `${prefix}Bottom`,
      x1: rect.left,
      y1: rect.bottom,
      x2: rect.right,
      y2: rect.bottom,
    },
  ];
  return (
    <g>
      {lines.map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={color}
          strokeWidth={line.id === selected ? 3 : 1.5}
          opacity={line.id === selected ? 1 : 0.75}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );
}
