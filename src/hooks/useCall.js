export default function useCall() {
    const makeCall = () => {
      const phone = "9582363174";
      window.location.href = `tel:${phone}`;
    };
  
    return { makeCall };
  }