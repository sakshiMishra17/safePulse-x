import { useState, useRef } from "react";
import SOSButton from "./components/SOSButton";
import StatusPanel from "./components/StatusPanel";
import LogPanel from "./components/LogPanel";
import FakeCall from "./components/FakeCall";

import useDetection from "./hooks/useDetection";
import useRecording from "./hooks/useRecording";
import useLocation from "./hooks/useLocation";
import useNetwork from "./hooks/useNetwork";
import useCall from "./hooks/useCall";

function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("SAFE");
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);

  const callTimerRef = useRef(null);

  const addLog = (msg) => {
    // ✅ Only allow important logs
    const important = ["🚨", "📞", "📱", "📍", "💾", "☁️"];
  
    const isImportant = important.some((icon) => msg.includes(icon));
  
    if (!isImportant) return;
  
    setLogs((prev) => {
      const updated = [...prev, msg];
  
      // ✅ Keep only last 5 logs
      return updated.slice(-5);
    });
  };

  // ✅ Hooks
  const { startRecording, switchCamera } = useRecording(addLog);
  const { startLocation } = useLocation(addLog);
  const { startNetwork } = useNetwork(addLog);
  const { makeCall } = useCall();

  // 🚨 SOS FUNCTION
  const triggerSOS = () => {
    setStatus("🚨 EMERGENCY");
    addLog("🚨 SOS Triggered");

    startRecording();
    startLocation();
    startNetwork();
    makeCall();
  };

  // 📞 FAKE CALL FUNCTION
  const triggerFakeCall = () => {
    if (showFakeCall) return; // prevent multiple triggers

    addLog("📞 Fake call triggered (threat detected)");
    setShowFakeCall(true);
    setCallAnswered(false);

    addLog("⏳ Waiting 10s for response");

    callTimerRef.current = setTimeout(() => {
      if (!callAnswered) {
        addLog("❌ No response → Auto SOS");
        triggerSOS();
      }
    }, 10000);
  };

  // 📞 HANDLE RESPONSE
  const handleCallResponse = (accepted) => {
    setCallAnswered(true);
    setShowFakeCall(false);

    if (callTimerRef.current) {
      clearTimeout(callTimerRef.current);
    }

    if (accepted) {
      addLog("✅ User marked safe");
      setStatus("SAFE");
    } else {
      addLog("❌ Call rejected → SOS");
      triggerSOS();
    }
  };

  // 🔍 MOTION DETECTION
  useDetection(triggerFakeCall, addLog);

  return (
    <div className="app">
      <h1>🚨 SafePulse X</h1>

      {/* 📱 Enable Camera & Mic */}
      <button
        onClick={async () => {
          try {
            await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            alert("Camera & Mic Enabled");
          } catch {
            alert("Permission denied");
          }
        }}
      >
        Enable Camera & Mic
      </button>

      {/* 📱 Enable Motion Detection (IMPORTANT) */}
      <button
        onClick={async () => {
          if (typeof DeviceMotionEvent.requestPermission === "function") {
            const res = await DeviceMotionEvent.requestPermission();
            alert("Motion Permission: " + res);
          } else {
            alert("Motion already allowed");
          }
        }}
      >
        Enable Motion Detection
      </button>

      {/* 🚨 SOS BUTTON */}
      <SOSButton triggerSOS={triggerSOS} />

      {/* 🔄 SWITCH CAMERA */}
      <button onClick={switchCamera}>🔄 Switch Camera</button>

      {/* 📊 STATUS + LOGS */}
      <StatusPanel status={status} />
      <LogPanel logs={logs} />

      {/* 📞 FAKE CALL UI */}
      {showFakeCall && <FakeCall onAnswer={handleCallResponse} />}
    </div>
  );
}

export default App;