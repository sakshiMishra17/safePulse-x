import { storage } from "../services/firebase";
import { ref, uploadBytes } from "firebase/storage";

let currentFacingMode = "environment";

export default function useRecording(addLog) {
  let mediaRecorder;
  let chunks = [];
  let currentStream = null;

  const startRecording = async () => {
    try {
      // Stop previous stream
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode },
        audio: true,
      });

      currentStream = stream;

      addLog("🎥 Camera + Mic started");

      // 🎥 CREATE VIDEO ELEMENT (FIXED)
      let video = document.getElementById("camera-preview");

      if (!video) {
        video = document.createElement("video");
        video.id = "camera-preview";

        video.style.width = "90%";
        video.style.maxWidth = "320px";
        video.style.marginTop = "10px";
        video.style.borderRadius = "10px";

        document.body.appendChild(video);
      }

      // 🔥 IMPORTANT FIXES
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;        // 🔥 required for autoplay
      video.playsInline = true;  // 🔥 required for iPhone

      await video.play();

      // 🎥 RECORDING
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });

        // 💾 LOCAL SAVE
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evidence_${Date.now()}.webm`;
        a.click();

        addLog("💾 Video saved");

        // ☁️ CLOUD UPLOAD
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

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, 10000);

    } catch (err) {
      addLog("❌ Camera/Mic permission denied");
      console.error(err);
    }
  };

  // 🔄 SWITCH CAMERA
  const switchCamera = () => {
    currentFacingMode =
      currentFacingMode === "user" ? "environment" : "user";

    startRecording();
  };

  return { startRecording, switchCamera };
}