export default function LogPanel({ logs }) {
    return (
      <div className="log">
        {logs.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>
    );
  }