export default function FakeCall({ onAnswer }) {
    return (
      <div className="fake-call">
        <h2>📞 Incoming Call</h2>
        <p>Private Number</p>
  
        <button onClick={() => onAnswer(true)}>✅ Accept</button>
        <button onClick={() => onAnswer(false)}>❌ Reject</button>
      </div>
    );
  }