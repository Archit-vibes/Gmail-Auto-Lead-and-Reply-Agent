import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get('userId');
    let userId = localStorage.getItem('userId');

    if (urlUserId) {
      userId = urlUserId;
      localStorage.setItem('userId', urlUserId);
      window.history.replaceState({}, document.title, window.location.pathname);
      // First time login - perform full sync
      syncWithGmail(userId);
    } else if (userId && userId !== 'null' && userId !== 'undefined') {
      // Returning user - just load from DB
      loadEmailsFromDB(userId);
    }
  }, []);

  // Full Sync (Gmail + LLM) - Triggered on login or manual refresh
  const syncWithGmail = async (id) => {
    console.log("Syncing with Gmail...");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/email/fetch-emails/${id}`);
      if (!response.ok) throw new Error('Failed to sync emails');
      const data = await response.json();
      setEmails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fast Load (Database Only) - Triggered on page mount
  const loadEmailsFromDB = async (id) => {
    console.log("Loading emails from database...");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/email/get-emails/${id}`);
      if (!response.ok) throw new Error('Failed to load emails from DB');
      const data = await response.json();
      setEmails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getHeader = (headers, name) => {
    if (!headers) return "";
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : "";
  };

  const formatSender = (fromHeader) => {
    if (!fromHeader) return "Unknown Sender";
    const nameMatch = fromHeader.match(/^([^<]+)/);
    return nameMatch ? nameMatch[1].replace(/"/g, '').trim() : fromHeader;
  };

  const getInitials = (sender) => {
    if (!sender) return "?";
    const parts = sender.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="logo" onClick={() => navigate("/dashboard")}>
          <div className="logo-icon"></div>
          <h2>MailFlow AI</h2>
        </div>
        <ul className="nav-links">
          <li className="active" onClick={() => navigate("/dashboard")}>
            <span className="icon">📊</span>
            <span>Overview</span>
          </li>
          <li onClick={() => navigate("/leads")}>
            <span className="icon">👥</span>
            <span>Leads</span>
          </li>
          <li>
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        <header className="top-header">
          <h1>Dashboard Overview</h1>
        </header>

        <section className="dashboard-cards-grid">
          <div className="status-card orange-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">👤</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">Total Leads</span>
              <span className="status-card-subtitle">Live Data</span>
            </div>
          </div>
          
          <div className="status-card red-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">🔥</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">High Priority</span>
              <span className="status-card-subtitle">Check Leads</span>
            </div>
          </div>
          
          <div className="status-card blue-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">✉️</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">Pending Replies</span>
              <span className="status-card-subtitle">Action Required</span>
            </div>
          </div>
          
          <div className="status-card green-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">📅</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">Meetings</span>
              <span className="status-card-subtitle">Scheduled</span>
            </div>
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="recent-activity glass-panel">
            <div className="activity-header">
              <h2>Recent Activity</h2>
              <button className="btn-text" onClick={() => {
                  const id = localStorage.getItem('userId');
                  if (id) loadEmailsFromDB(id);
              }}>↻</button>
            </div>
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon blue">🤖</div>
                <div className="activity-details">
                  <h4>AI System Active</h4>
                  <p>Monitoring your inbox for new leads.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="email-scroll glass-panel">
            <div className="activity-header">
              <h2>Current Emails</h2>
              <div className="header-actions">
                {loading && <span className="sync-status">Syncing...</span>}
                <button 
                    className={`btn-text ${loading ? 'spinning' : ''}`}
                    title="Refresh from Gmail"
                    onClick={() => {
                    const id = localStorage.getItem('userId');
                    if (id) syncWithGmail(id);
                    }}
                >
                    ↻
                </button>
              </div>
            </div>
            <div className="email-list">
              {loading && emails.length === 0 && <p style={{padding: '1rem'}}>Connecting to your inbox...</p>}
              {error && <p style={{padding: '1rem', color: '#ef4444'}}>Error: {error}</p>}
              {!loading && !error && emails.length === 0 && (
                 <p style={{padding: '1rem'}}>No emails connected yet. Click refresh to sync.</p>
              )}
              {emails.map((email, i) => {
                const sender = email.sender || "Unknown Sender";
                const subject = email.subject || "No Subject";
                const initials = getInitials(sender);
                const snippet = email.body ? (email.body.substring(0, 100) + (email.body.length > 100 ? "..." : "")) : "No content";
                
                const colors = ['#eab308', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
                const avatarColor = colors[i % colors.length];

                return (
                  <div key={email.id} className="email-item">
                    <div className="email-avatar" style={{backgroundColor: avatarColor}}>{initials}</div>
                    <div className="email-content">
                      <div className="email-top">
                        <span className="email-sender">{sender}</span>
                        <span className="email-time">
                          {new Date(email.receivedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="email-subject">{subject}</span>
                      <p className="email-snippet">{snippet}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
