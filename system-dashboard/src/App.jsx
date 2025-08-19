import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("latest");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [latestRes, historyRes] = await Promise.all([
        fetch("https://solsphere-assignment-backend.vercel.app/api/system-info/latest").then((r) => r.json()),
        fetch("https://solsphere-assignment-backend.vercel.app/api/system-info/history").then((r) => r.json()),
      ]);
      setLatest(latestRes);
      setHistory(historyRes);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <h1 className="title">System Reports Dashboard</h1>

      <div className="tabs">
        <button
          className={tab === "latest" ? "active" : ""}
          onClick={() => setTab("latest")}
        >
          Latest Report
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          Last 24 Hours
        </button>
      </div>

      <div className="content">
        {tab === "latest" && (
          <div>
            {loading && !latest ? (
              <p className="loading">Loading...</p>
            ) : (
              latest && (
                <div className="card">
                  <h2>Latest Report</h2>
                  <div className="grid">
                    <StatCard label="Machine ID" value={`${latest.machine_id}%`} />
                    <StatCard label="OS" value={`${latest.os} ${latest.os_version}`} />
                    <StatCard label="Disk Encryption" value={latest.disk_encryption ? "Enabled" : "Disabled"}/>
                    <StatCard label="OS Update" value={latest.os_update} />
                    <StatCard label="Antivirus" value={latest.antivirus ? "Enabled" : "Disabled"}/>
                    <StatCard label="Sleep Settings" value={latest.sleep_setting_ok ? "Enabled" : "Disabled"}/>
                    <StatCard label="CPU Usage" value={`${latest.system_stats.cpu_percent}%`} />
                    <StatCard label="Memory Usage" value={`${latest.system_stats.memory_percent}%`} />
                    <StatCard label="Disk Usage" value={`${latest.system_stats.disk_percent}%`} />
                    <StatCard
                      label="Last Checked"
                      value={new Date(latest.last_check).toLocaleString()}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            {loading && history.length === 0 ? (
              <p className="loading">Loading...</p>
            ) : (
              <div className="card">
                <h2>Reports in Last 24 Hours</h2>
                <div className="report-list">
                  {history.map((report, idx) => (
                    <div key={idx} className="report-item">
                      <p><strong>Machine Id:</strong> {report.machine_id}</p>
                      <p><strong>OS:</strong> {report.os} {report.os_version} (Release {report.os_release})</p>
                      <p><strong>CPU Usage:</strong> {report.system_stats.cpu_percent}%</p>
                      <p><strong>Memory Usage:</strong> {report.system_stats.memory_percent}%</p>
                      <p><strong>Disk Usage:</strong> {report.system_stats.disk_percent}%</p>
                      <p><strong>Disk Encryption:</strong> {report.disk_encryption ? "Enabled" : "Disabled"}</p>
                      <p><strong>Antivirus:</strong> {report.antivirus ? "Enabled" : "Disabled"}</p>
                      <p><strong>Sleep Settings:</strong> {report.sleep_setting_ok ? "Enabled" : "Disabled"}</p>
                      <p><strong>Update:</strong> {report.os_update}</p>
                      <p><strong>Last Checked:</strong> {new Date(report.last_check).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
    </div>
  );
}
