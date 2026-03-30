import { useEffect, useRef } from "react";

export default function useDetection(triggerFakeCall, addLog) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;

      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      const delta =
        Math.abs(x - lastX) +
        Math.abs(y - lastY) +
        Math.abs(z - lastZ);

      // 🔥 Detect sudden motion
      if (delta > 15 && !triggeredRef.current) {
        triggeredRef.current = true;

        addLog("📱 Sudden movement detected!");
        triggerFakeCall();

        // ⏳ Prevent multiple triggers for 5 sec
        setTimeout(() => {
          triggeredRef.current = false;
        }, 10000);
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotion);

    addLog("🔍 Motion detection active");

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);
}