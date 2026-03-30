import { useRef } from "react";
import { storage } from "../services/firebase";
import { ref, uploadBytes } from "firebase/storage";

export default function useRecording(addLog) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const facingModeRef = useRef("environment");

  // 🚀 Start Camera + Recording
  const startRecording = async () => {
    try {
      // 👉 If already running, don't restart camera
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingModeRef.current },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        streamRef.current = stream;

        addLog("🎥 Camera started");

        // 🎥 Attach preview
        let video = document.getElementById("camera-preview");

        if (!video) {
          video = document.createElement("video");
          video.id = "camera-preview";

          video.style.width = "90%";
          video.style.maxWidth = "320px";
          video.style.borderRadius = "10px";
          video.style.marginTop = "10px";

          document.body.appendChild(video);
        }

        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;       // required
        video.playsInline = true; // iPhone fix

        await video.play();
      }

      const stream = streamRef.current;

      // 🎥 Recorder setup
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: "video/webm",
        });

        const url = URL.createObjectURL(blob);

        // 💾 Silent local save (no popup)
        localStorage.setItem(`video_${Date.now()}`, url);
        addLog("💾 Video saved locally");

        // ☁️ Upload to Firebase
        try {
          const storageRef = ref(
            storage,
            `evidence/video_${Date.now()}.webm`
          );
          await uploadBytes(storageRef, blob);
          addLog("☁️ Uploaded to cloud");
        } catch {
          addLog("❌ Upload failed");
        }

        addLog("🎥 Recording complete (camera still active)");
      };

      recorder.start();

      // ⏱ Stop after 10 seconds (BUT KEEP CAMERA ON)
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, 10000);

    } catch (err) {
      console.error(err);
      addLog("❌ Camera/Mic error");
    }
  };

  // 🔄 Switch Camera (front/back)
  const switchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    facingModeRef.current =
      facingModeRef.current === "user" ? "environment" : "user";

    addLog("🔄 Switching camera...");
    await startRecording();
  };

  return { startRecording, switchCamera };
}
