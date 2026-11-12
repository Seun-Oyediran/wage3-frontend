"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

/**
 * Lets a file be dropped anywhere on the page while `enabled`. Returns whether a file is being
 * dragged over the page. A depth counter stops it flickering as the drag crosses child elements.
 */
export function usePageFileDrop({ enabled, onDrop }: { enabled: boolean; onDrop: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const handleDrop = useEffectEvent(onDrop);

  useEffect(() => {
    if (!enabled) return;
    const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes("Files");

    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current++;
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault(); // required for drop to fire
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); // stop the browser opening the file
      depth.current = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleDrop(file);
    };

    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
      depth.current = 0;
      setDragging(false);
    };
  }, [enabled]);

  return dragging;
}
