import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader-camera", { verbose: false });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (html5QrCode.isScanning) {
                html5QrCode.pause();
            }
            onScan(decodedText);
            setTimeout(() => {
                onClose();
            }, 300);
          },
          (errorMessage) => {
            // ignore constant failures
          }
        );
        setIsReady(true);
      } catch (err: any) {
        console.error("Camera error:", err);
        setError("Camera permission denied or device not found.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(console.error);
        } else {
            scannerRef.current.clear();
        }
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white absolute top-0 w-full z-10">
        <h3 className="text-lg font-bold flex items-center gap-2">
            <Camera size={20} />
            Scan Barcode
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition shadow"
        >
          <X size={24} />
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 w-full h-full flex flex-col justify-center relative bg-black">
        <div id="reader-camera" className="w-full h-full"></div>
        
        {/* Safe Area Overlay for User */}
        {isReady && !error && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-[250px] h-[250px] border-2 border-green-500 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
                    
                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-scan"></div>
                </div>
                <p className="text-white mt-8 font-medium">Align barcode within the frame</p>
            </div>
        )}

        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <p className="text-white text-center p-6 bg-red-500/20 rounded-2xl border border-red-500">{error}</p>
            </div>
        )}
      </div>
    </div>
  );
}
