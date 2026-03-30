export default function useLocation(addLog) {

    const sendSMS = (lat, lng) => {
      const phone = "9582363174 ,8826143002";
  
      const msg = `🚨 Emergency!
  https://maps.google.com/?q=${lat},${lng}`;
  
      window.location.href = `sms:${phone}&body=${encodeURIComponent(msg)}`;
    };
  
    const startLocation = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
  
        addLog(`📍 ${latitude}, ${longitude}`);
        sendSMS(latitude, longitude);
      });
    };
  
    return { startLocation };
  }