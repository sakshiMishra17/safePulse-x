export default function useNetwork(addLog) {
    const startNetwork = () => {
      if (navigator.onLine) {
        addLog("🌐 Online mode");
      } else {
        addLog("📡 Offline mesh simulated");
      }
    };
  
    return { startNetwork };
  }