"use client";

import { useEffect, useRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  onError: (message: string) => void;
};

export default function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsOpen(false);
  }

  async function startCamera() {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      onError("Camera is not supported on this browser/device.");
      return;
    }

    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsOpen(true);
    } catch (error) {
      const message =
        error instanceof Error && error.name === "NotAllowedError"
          ? "Camera permission denied. Please allow access and try again."
          : "Unable to start camera. Check permissions and device availability.";
      onError(message);
    } finally {
      setIsStarting(false);
    }
  }

  function captureFrame() {
    if (!videoRef.current || !canvasRef.current) {
      onError("Camera is not ready yet.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      onError("Could not capture image. Please try again.");
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      onError("Unable to process captured frame.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onError("Capture failed. Please retry.");
          return;
        }
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startCamera}
          disabled={isOpen || isStarting || !hasCamera}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isStarting ? "Starting..." : "Start Camera"}
        </button>

        <button
          type="button"
          onClick={captureFrame}
          disabled={!isOpen}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Capture
        </button>

        <button
          type="button"
          onClick={stopCamera}
          disabled={!isOpen}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Close Camera
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`aspect-video w-full object-cover ${isOpen ? "block" : "hidden"}`}
        />
        {!isOpen ? (
          <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-slate-400">
            Camera preview appears here after you start the camera.
          </div>
        ) : null}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
