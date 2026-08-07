import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { formatTimeWIB, formatIndonesianDate } from '../../utils/dateUtils';

interface WebcamCaptureProps {
  onPhotoCaptured: (photoBase64: string) => void;
  initialPhotoUrl?: string;
}

const SAMPLE_WFH_PHOTOS = [
  {
    name: 'Setup Home Office 1',
    url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Setup Home Office 2',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Laptop & Work Desk',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
  },
];

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onPhotoCaptured,
  initialPhotoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(initialPhotoUrl || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [useUploadMode, setUseUploadMode] = useState<boolean>(false);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Webcam permission error or missing device:', err);
      setCameraError('Kamera tidak terdeteksi atau izin akses ditolak. Anda dapat mengunggah file foto secara manual.');
      setIsCameraActive(false);
      setUseUploadMode(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  useEffect(() => {
    if (!capturedImage && !useUploadMode) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Snapshot
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle horizontal mirror if needed
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform for overlay watermark text
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw dark semi-transparent banner for Timestamp & Proof watermark
    const bannerHeight = 60;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    // Add Date and Time Stamp
    const now = new Date();
    const dateStr = formatIndonesianDate(now);
    const timeStr = formatTimeWIB(now);

    ctx.fillStyle = '#10B981'; // Emerald color
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(` [WFH PROOF] - ${timeStr}`, 16, canvas.height - 35);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${dateStr} • Bukti Kerja Dari Rumah`, 16, canvas.height - 15);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    onPhotoCaptured(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setUseUploadMode(false);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        onPhotoCaptured(result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setCapturedImage(sampleUrl);
    onPhotoCaptured(sampleUrl);
    stopCamera();
  };

  return (
    <div className="space-y-4">
      {/* Hidden Canvas for rendering snapshot with watermark */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Captured Image View */}
      {capturedImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 group">
          <img
            src={capturedImage}
            alt="Bukti Foto WFH Karyawan"
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <CheckCircle2 className="w-4 h-4" /> Foto WFH Ter-capture
          </div>

          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
            <button
              type="button"
              onClick={handleRetake}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" /> Foto Ulang / Ambil Ulang
            </button>
          </div>
        </div>
      ) : useUploadMode || cameraError ? (
        /* File Upload Mode or Fallback */
        <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/50 transition-colors">
          {cameraError && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Unggah Foto Bukti WFH</p>
              <p className="text-xs text-slate-400 mt-1">
                Pilih foto diri sedang bekerja di rumah (Format JPG, PNG)
              </p>
            </div>

            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-emerald-500/20 inline-flex items-center gap-2 mt-2">
              <ImageIcon className="w-4 h-4" />
              <span>Pilih File Foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {!cameraError && (
              <button
                type="button"
                onClick={() => {
                  setUseUploadMode(false);
                  startCamera();
                }}
                className="text-xs text-emerald-400 hover:underline mt-2 flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" /> Gunakan Kamera Webcam
              </button>
            )}

            {/* Quick Sample Selector */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 w-full">
              <p className="text-xs text-slate-400 mb-2">Atau gunakan pilihan contoh foto WFH:</p>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_WFH_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.url)}
                    className="group/btn relative rounded-lg overflow-hidden border border-slate-800 hover:border-emerald-500 transition-all text-left"
                  >
                    <img src={sample.url} alt={sample.name} className="w-full h-16 object-cover" />
                    <span className="block text-[10px] text-slate-300 p-1 bg-slate-900/90 truncate">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Webcam Mode */
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-64 sm:h-80 object-cover ${isMirrored ? '-scale-x-100' : ''}`}
          />

          {/* Camera Status Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/80 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Webcam Active
          </div>

          {/* Mirror & Toggle Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMirrored(!isMirrored)}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 p-2 rounded-xl backdrop-blur-md text-xs border border-slate-700 transition-colors"
              title="Cermin Kamera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setUseUploadMode(true)}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
            <button
              type="button"
              onClick={captureSnapshot}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center gap-2 text-sm transform active:scale-95"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>Capture Foto WFH Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
