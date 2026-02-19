'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lookupBarcode, ProductInfo } from '@/lib/barcode-api';

interface Props {
  onResult: (product: ProductInfo) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [lastScanned, setLastScanned] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
      }
    } catch {
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
    }
  }, []);

  // BarcodeDetector API (Chrome/Edge/Samsung Internet 지원)
  useEffect(() => {
    if (!scanning) return;

    let active = true;

    const detect = async () => {
      if (!active || !videoRef.current || !('BarcodeDetector' in window)) return;

      try {
        // @ts-expect-error BarcodeDetector is not in TS types yet
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
        const barcodes = await detector.detect(videoRef.current);

        if (barcodes.length > 0 && barcodes[0].rawValue !== lastScanned) {
          const code = barcodes[0].rawValue;
          setLastScanned(code);
          setLookingUp(true);

          const product = await lookupBarcode(code);
          if (product) {
            stopCamera();
            onResult(product);
            return;
          } else {
            setError(`바코드 ${code}의 제품 정보를 찾을 수 없습니다. 수동으로 입력해주세요.`);
            setLookingUp(false);
          }
        }
      } catch {
        // detector not available, fall through
      }

      if (active) {
        requestAnimationFrame(() => setTimeout(detect, 500));
      }
    };

    // Fallback: BarcodeDetector 없으면 안내
    if (!('BarcodeDetector' in window)) {
      // quagga2 동적 로드
      import('@ericblade/quagga2').then((Quagga) => {
        if (!videoRef.current || !active) return;

        Quagga.default.init(
          {
            inputStream: {
              type: 'LiveStream',
              target: videoRef.current.parentElement!,
              constraints: { facingMode: 'environment' },
            },
            decoder: {
              readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
            },
            locate: true,
          },
          (err) => {
            if (err) {
              setError('바코드 스캐너 초기화에 실패했습니다.');
              return;
            }
            Quagga.default.start();
          }
        );

        Quagga.default.onDetected(async (result) => {
          const code = result.codeResult?.code;
          if (!code || code === lastScanned) return;
          setLastScanned(code);
          setLookingUp(true);

          const product = await lookupBarcode(code);
          if (product) {
            Quagga.default.stop();
            stopCamera();
            onResult(product);
          } else {
            setError(`바코드 ${code}의 제품 정보를 찾을 수 없습니다.`);
            setLookingUp(false);
          }
        });
      });

      return () => {
        active = false;
        import('@ericblade/quagga2').then((Quagga) => Quagga.default.stop()).catch(() => {});
      };
    }

    detect();
    return () => { active = false; };
  }, [scanning, lastScanned, onResult, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-bold text-white">📷 바코드 스캔</h2>
        <button onClick={() => { stopCamera(); onClose(); }} className="rounded-full bg-white/20 p-2">
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Camera View */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-72 rounded-2xl border-2 border-white/60">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500 animate-pulse" />
          </div>
        </div>

        {/* Loading */}
        {lookingUp && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> 제품 정보 조회 중...
            </div>
          </div>
        )}
      </div>

      {/* Error / Info */}
      <div className="p-4">
        {error ? (
          <div className="mb-2 rounded-lg bg-red-900/50 p-3 text-sm text-red-200">{error}</div>
        ) : (
          <p className="text-center text-sm text-white/60">
            바코드를 사각형 안에 맞춰주세요
          </p>
        )}
        <Button
          variant="outline"
          className="mt-2 w-full border-white/30 text-white hover:bg-white/10"
          onClick={() => { stopCamera(); onClose(); }}
        >
          수동으로 입력하기
        </Button>
      </div>
    </div>
  );
}
