import { useEffect, useRef } from 'react';
import { playScanSuccessBeep, playScanErrorBeep } from '../utils/soundEffects';

/**
 * High-speed USB / Handheld Barcode Scanner listener.
 * Physical barcode scanners emulate HID keyboard input, outputting
 * keystrokes rapidly (typically 10-40ms between characters) ending with 'Enter'.
 */
export const useBarcodeScanner = ({
  products = [],
  onScan,
  onUnknown,
  enabled = true,
}) => {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const productsRef = useRef(products);
  const onScanRef = useRef(onScan);
  const onUnknownRef = useRef(onUnknown);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onUnknownRef.current = onUnknown;
  }, [onUnknown]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Most barcode scanners send characters within 50ms of each other.
      // If time gap between keystrokes is more than 80ms, it is human manual typing.
      if (timeDiff > 80) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const scannedCode = bufferRef.current.trim();
        bufferRef.current = '';

        // If at least 3 characters arrived rapidly before Enter, it's a scanner gun!
        if (scannedCode.length >= 3) {
          e.preventDefault();
          e.stopPropagation();

          const cleanCode = scannedCode.toLowerCase();
          const matched = productsRef.current.find(
            (p) =>
              (p.barcode && p.barcode.toLowerCase() === cleanCode) ||
              (p.sku && p.sku.toLowerCase() === cleanCode) ||
              (p.id && p.id.toLowerCase() === cleanCode)
          );

          if (matched) {
            playScanSuccessBeep();
            if (onScanRef.current) {
              onScanRef.current(matched, scannedCode);
            }
          } else {
            playScanSuccessBeep(); // Beep to acknowledge physical scan
            if (onUnknownRef.current) {
              onUnknownRef.current(scannedCode);
            }
          }
        }
        return;
      }

      // Collect single character keys
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled]);
};
