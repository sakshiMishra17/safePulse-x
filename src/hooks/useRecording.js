import { useRef } from "react";
import { storage } from "../services/firebase";
import { ref, uploadBytes } from "firebase/storage";

export default function useRecording(addLog) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const facingModeRef = useRef("environment");

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      // 🛑 Stop previous stream (IMPORTANT)
      stopStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingModeRef.current },
        audio: true,
      });

      streamRef.current = stream;

      addLog("🎥 Camera started");

      // 🎥 VIDEO ELEMENT
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

      // 🔥 FIXES
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      await video.play();

      // 🎥 RECORDING
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

        // 💾 SAVE LOCALLY
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evidence_${Date.now()}.webm`;
        a.click();

        addLog("💾 Video saved");

        // ☁️ UPLOAD
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
      };

      recorder.start();

      // ⏱ Stop after 10 sec
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
          stopStream();
        }
      }, 10000);

    } catch (err) {
      console.error(err);
      addLog("❌ Camera permission denied or error");
    }
  };

  // 🔄 SWITCH CAMERA (FIXED)
  const switchCamera = async () => {
    facingModeRef.current =
      facingModeRef.current === "user" ? "environment" : "user";

    addLog("🔄 Switching camera...");
    await startRecording();
  };

  return { startRecording, switchCamera };
}
