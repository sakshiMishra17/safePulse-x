export default function SOSButton({ triggerSOS }) {
    return (
      <button className="sos-btn" onClick={triggerSOS}>
        🚨 SEND SOS
      </button>
    );
  }