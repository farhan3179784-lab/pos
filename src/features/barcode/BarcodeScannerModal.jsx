import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { playScanSuccessBeep, playScanErrorBeep } from '../../utils/soundEffects';

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  products = [],
  onProductScanned,
  onRegisterBarcode,
  onQuickSaveProduct,
}) => {
  const [activeTab, setActiveTab] = useState('camera');
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  // Quick register fields for newly scanned physical barcodes
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickUnit, setQuickUnit] = useState('pcs');
  const [copiedCode, setCopiedCode] = useState(false);

  // File upload state
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [fileError, setFileError] = useState(null);

  // STABLE REFS to prevent camera restarting or pausing on state changes
  const productsRef = useRef(products);
  productsRef.current = products;

  const onProductScannedRef = useRef(onProductScanned);
  onProductScannedRef.current = onProductScanned;

  const onQuickSaveProductRef = useRef(onQuickSaveProduct);
  onQuickSaveProductRef.current = onQuickSaveProduct;

  const html5QrCodeRef = useRef(null);
  const lastScannedTimeRef = useRef(0);
  const lastScannedCodeRef = useRef('');
  const fileInputRef = useRef(null);
  const nativeDetectorLoopRef = useRef(null);

  // Process barcode lookup with zero camera lag
  const handleProcessBarcode = useCallback((code) => {
    if (!code) return;
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    // Fast 500ms debounce for the exact same barcode
    const now = Date.now();
    if (clean === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 500) {
      return;
    }
    lastScannedCodeRef.current = clean;
    lastScannedTimeRef.current = now;

    // Look up in current products using ref
    const currentProducts = productsRef.current || [];
    const matched = currentProducts.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === clean) ||
        (p.sku && p.sku.toLowerCase() === clean) ||
        (p.id && p.id.toLowerCase() === clean)
    );

    playScanSuccessBeep();

    if (matched) {
      setLastScanned({
        success: true,
        product: matched,
        code: clean,
      });
      if (onProductScannedRef.current) {
        onProductScannedRef.current(matched, clean);
      }
      setManualCode('');
    } else {
      // Physical barcode detected, but not yet in database
      setLastScanned({
        success: false,
        isNewCode: true,
        code: clean,
      });
      setQuickName('');
      setQuickPrice('');
    }
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleProcessBarcode(manualCode);
    } else {
      playScanErrorBeep();
    }
  };

  // Safe camera stop
  const stopCameraSafe = useCallback(async () => {
    if (nativeDetectorLoopRef.current) {
      cancelAnimationFrame(nativeDetectorLoopRef.current);
      nativeDetectorLoopRef.current = null;
    }

    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Start Camera - called strictly ONCE on modal open
  const startCamera = useCallback(
    async (cameraIdToUse) => {
      try {
        setCameraError(null);
        await stopCameraSafe();

        // 1. Get cameras list if not fetched
        let cameras = availableCameras;
        if (!cameras || cameras.length === 0) {
          try {
            cameras = await Html5Qrcode.getCameras();
            setAvailableCameras(cameras);
          } catch (e) {
            console.warn('Cameras list error:', e);
            cameras = [];
          }
        }

        let targetCamId = cameraIdToUse || selectedCameraId;
        if (!targetCamId && cameras.length > 0) {
          targetCamId = cameras[0].id;
          setSelectedCameraId(targetCamId);
        }

        // 2. Initialize instance with ultra-fast barcode formats
        const qrCodeInstance = new Html5Qrcode('pos-barcode-viewport', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true, // Native fast C++ detector
          },
          verbose: false,
        });

        // CRITICAL FIX: Override pause() so Html5Qrcode CAN NEVER PAUSE!
        // This permanently eliminates the "Scanner paused" bug!
        qrCodeInstance.pause = function () {
          console.log('[Html5Qrcode] Prevented auto-pause, scanner stays live!');
        };

        html5QrCodeRef.current = qrCodeInstance;

        // 3. Camera config: Prefer exact deviceId or user facing
        const cameraConfig = targetCamId ? targetCamId : { facingMode: 'user' };

        // 4. Scan config: 30 FPS continuous scanning with wide reticle box
        const scanConfig = {
          fps: 30,
          aspectRatio: 1.333333,
          disableFlip: false,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            return {
              width: Math.floor(viewfinderWidth * 0.95),
              height: Math.floor(viewfinderHeight * 0.75),
            };
          },
        };

        await qrCodeInstance.start(
          cameraConfig,
          scanConfig,
          (decodedText) => {
            // NEVER pause the scanner on decode! Continue running live!
            handleProcessBarcode(decodedText);
          },
          () => {
            // Frame error - frame did not contain barcode (normal)
          }
        );

        setIsScanning(true);

        // Hide any "Scanner paused" element created internally by Html5Qrcode
        setTimeout(() => {
          const pausedBanner = document.querySelector('#pos-barcode-viewport > div:not(#pos-barcode-viewport_scan_region)');
          if (pausedBanner && pausedBanner.innerText?.includes('paused')) {
            pausedBanner.style.display = 'none';
          }
        }, 100);

        // SECONDARY ULTRA-FAST SCANNER: Native BarcodeDetector running at 60 FPS on the video element
        if ('BarcodeDetector' in window) {
          try {
            const nativeDetector = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'code_128', 'code_39', 'qr_code'],
            });

            const runNativeLoop = async () => {
              const video = document.querySelector('#pos-barcode-viewport video');
              if (video && video.readyState >= 2 && !video.paused) {
                try {
                  const detected = await nativeDetector.detect(video);
                  if (detected && detected.length > 0) {
                    handleProcessBarcode(detected[0].rawValue);
                  }
                } catch {
                  // frame decode skip
                }
              }
              nativeDetectorLoopRef.current = requestAnimationFrame(runNativeLoop);
            };

            nativeDetectorLoopRef.current = requestAnimationFrame(runNativeLoop);
          } catch (e) {
            console.warn('Native BarcodeDetector loop init failed:', e);
          }
        }
      } catch (err) {
        console.warn('Camera scan start failed:', err);
        setCameraError(
          err?.message || 'کیمرہ شروع نہیں ہو سکا۔ براؤزر کو کیمرے کی اجازت دیں (Allow Camera)۔'
        );
        setIsScanning(false);
      }
    },
    [availableCameras, selectedCameraId, stopCameraSafe, handleProcessBarcode]
  );

  // File Upload Scanner
  const handleFileScan = async (file) => {
    if (!file) return;
    setIsScanningFile(true);
    setFileError(null);

    try {
      const fileScanner = new Html5Qrcode('pos-barcode-file-proxy', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
        verbose: false,
      });

      const decoded = await fileScanner.scanFile(file, true);
      fileScanner.clear();

      if (decoded) {
        handleProcessBarcode(decoded);
      } else {
        playScanErrorBeep();
        setFileError('تصویر میں کوئی بار کوڈ نہیں ملا۔');
      }
    } catch {
      playScanErrorBeep();
      setFileError('اس تصویر میں بار کوڈ واضح نہیں ہے۔ براہ کرم سیدھی تصویر لیں۔');
    } finally {
      setIsScanningFile(false);
    }
  };

  // Save new physical product on the fly
  const handleInlineQuickSave = async (e) => {
    e.preventDefault();
    if (!lastScanned?.code || !quickName.trim() || !quickPrice) {
      playScanErrorBeep();
      return;
    }

    const newProd = {
      id: `prod_${Date.now()}`,
      name: quickName.trim(),
      nameUrdu: quickName.trim(),
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: lastScanned.code,
      category: 'General Items',
      unit: quickUnit || 'pcs',
      price: Number(quickPrice),
      stock: 100,
      threshold: 10,
      image: '',
      description: `Scanned item (${lastScanned.code})`,
    };

    if (onQuickSaveProductRef.current) {
      await onQuickSaveProductRef.current(newProd);
    } else if (onRegisterBarcode) {
      onRegisterBarcode(lastScanned.code);
    }

    if (onProductScannedRef.current) {
      onProductScannedRef.current(newProd, lastScanned.code);
    }

    playScanSuccessBeep();
    setLastScanned({
      success: true,
      product: newProd,
      code: lastScanned.code,
    });
  };

  // Copy barcode helper
  const handleCopyBarcode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Camera lifecycle hook
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCameraSafe();
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        startCamera();
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
      stopCameraSafe();
    };
  }, [isOpen, activeTab]);

  // Clean close
  const handleModalClose = () => {
    stopCameraSafe();
    setIsScanning(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="POS Fast Barcode Scanner (بار کوڈ اسکینر)"
      subtitle="لائیو کیمرے کے سامنے بار کوڈ رکھیں — مسلسل اسکیننگ فعال ہے"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Hidden proxy container for file barcode scanner */}
        <div id="pos-barcode-file-proxy" className="hidden" />

        {/* Live Scanner Status Beacon */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                <Icon name="barcode" size={16} />
                Live Continuous Scanner (لائیو اسکینر مسلسل فعال ہے)
              </h4>
              <p className="text-xs text-slate-400 font-urdu mt-0.5">
                بار کوڈ کو کیمرے کے سامنے 6 سے 10 انچ کے فاصلے پر رکھیں۔
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            ACTIVE 30 FPS
          </Badge>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="camera" size={16} />
            <span>کیمرہ اسکینر</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await stopCameraSafe();
              setActiveTab('upload');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="upload" size={16} />
            <span>تصویر سے اسکین</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await stopCameraSafe();
              setActiveTab('quick');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="barcode" size={16} />
            <span>نمبر درج کریں</span>
          </button>
        </div>

        {/* TAB 1: WEBCAM CAMERA SCANNER */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            {/* Viewport for html5-qrcode (Strictly Single Live Camera Feed, No Canvas, Never Paused) */}
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner min-h-[300px] w-full">
              <div
                id="pos-barcode-viewport"
                className="w-full h-[320px] sm:h-[360px] overflow-hidden relative block [&_canvas]:!hidden [&_video]:!block [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover"
              />

              {/* Viewfinder Target Reticle Frame Overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="relative w-full max-w-[340px] h-[180px] border-2 border-dashed border-emerald-400 rounded-2xl flex items-center justify-center shadow-2xl bg-emerald-500/5">
                    {/* Corners */}
                    <div className="absolute top-1 left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute top-1 right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute bottom-1 left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute bottom-1 right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400" />

                    {/* Animated Laser Scanner Line */}
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2">
                      <div className="h-0.5 w-full bg-rose-500 shadow-lg shadow-rose-500 animate-pulse" />
                    </div>

                    <span className="absolute bottom-2 text-xs font-urdu font-bold text-emerald-300 bg-slate-900/90 px-3 py-1 rounded-full border border-emerald-500/40">
                      بار کوڈ کو اس لال لائن کے سامنے رکھیں
                    </span>
                  </div>
                </div>
              )}

              {/* Camera selection dropdown if multiple cameras */}
              {availableCameras.length > 1 && isScanning && (
                <div className="absolute top-3 right-3 z-20">
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedCameraId(id);
                      startCamera(id);
                    }}
                    className="bg-slate-900/90 border border-slate-700 text-white rounded-xl px-2.5 py-1 text-xs font-bold"
                  >
                    {availableCameras.map((cam, idx) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Camera loading or error fallback */}
              {!isScanning && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-10">
                  <Icon name="camera" size={36} className="text-slate-400 mb-2" />
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xs font-urdu leading-relaxed">
                    {cameraError || 'کیمرہ شروع کیا جا رہا ہے...'}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    icon="camera"
                    onClick={() => startCamera()}
                    className="mt-3 font-bold"
                  >
                    دوبارہ کیمرہ آن کریں
                  </Button>
                </div>
              )}
            </div>

            {/* Quick scanning tips */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-urdu leading-relaxed flex items-center justify-between">
              <div>
                💡 <strong>تیز اسکیننگ کا طریقہ:</strong> پروڈکٹ کو کیمرے سے <strong>6 سے 10 انچ دور</strong> رکھیں تاکہ بار کوڈ بالکل صاف نظر آئے۔
              </div>
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-xs font-bold shrink-0 ml-2 cursor-pointer"
              >
                ری فریش کیمرہ ↺
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD IMAGE */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileScan(file);
              }}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileScan(file);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <Icon name="upload" size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                بار کوڈ کی تصویر منتخب کریں
              </h4>
              <p className="text-xs text-slate-500 font-urdu mt-1">
                موبائل سے لی گئی تصویر اپلوڈ کر کے بھی فوری اسکین کر سکتے ہیں۔
              </p>
              <Button
                variant="primary"
                size="sm"
                icon="upload"
                className="mt-4 pointer-events-none"
                disabled={isScanningFile}
              >
                {isScanningFile ? 'اسکیننگ جاری ہے...' : 'تصویر اپلوڈ کریں'}
              </Button>
            </div>
            {fileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-urdu">
                {fileError}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANUAL INPUT */}
        {activeTab === 'quick' && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="text-xs sm:text-sm font-bold text-slate-700 block">
              بار کوڈ نمبر خود درج کریں (Enter Barcode):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="مثلاً: 8961014255799"
                className="flex-1 text-base font-mono bg-white border-2 border-slate-300 rounded-xl py-2.5 px-3.5 focus:border-indigo-600 outline-none text-slate-900 font-bold"
                autoFocus
              />
              <Button type="submit" variant="primary" size="md" icon="barcode">
                اسکین کریں
              </Button>
            </div>
          </form>
        )}

        {/* Live Scanned Status & Instant Quick Add Box */}
        {lastScanned && (
          <div
            className={`p-4 rounded-2xl border space-y-3 animate-fadeIn ${
              lastScanned.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-indigo-50 border-indigo-300 text-indigo-950'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    lastScanned.success ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  <Icon name="barcode" size={22} />
                </div>
                <div className="min-w-0">
                  {lastScanned.success ? (
                    <>
                      <div className="font-black text-sm sm:text-base text-emerald-950 truncate">
                        {lastScanned.product.name} ({lastScanned.product.nameUrdu || ''})
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-700 font-bold mt-0.5">
                        {formatCurrency(lastScanned.product.price)} • بل میں شامل ہو گیا!
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-black text-sm sm:text-base text-indigo-950 flex items-center gap-2 flex-wrap">
                        <span>نیا بار کوڈ اسکین ہوا:</span>
                        <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-900 font-black">
                          {lastScanned.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBarcode(lastScanned.code)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-1 cursor-pointer"
                        >
                          {copiedCode ? 'کاپی ہو گیا!' : 'کاپی'}
                        </button>
                      </div>
                      <div className="text-xs text-indigo-700 font-urdu mt-0.5">
                        یہ سامان پہلی بار اسکین ہوا ہے۔ نیچے نام اور قیمت لکھ کر محفوظ کریں:
                      </div>
                    </>
                  )}
                </div>
              </div>

              {lastScanned.success && (
                <Badge variant="success" size="sm">
                  شامل ہو گیا
                </Badge>
              )}
            </div>

            {/* Quick Inline Add Form if Product is not in catalog */}
            {!lastScanned.success && (
              <form
                onSubmit={handleInlineQuickSave}
                className="pt-3 border-t border-indigo-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
              >
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    سامان کا نام (Product Name):
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: Olpers Milk / لائف بوائے"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-indigo-300 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    قیمت (Rs.):
                  </label>
                  <input
                    type="number"
                    placeholder="قیمت"
                    min="1"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-indigo-300 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors shadow-xs cursor-pointer"
                  >
                    بل میں ڈالیں
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
