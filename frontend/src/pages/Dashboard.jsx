import React, { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Dashboard() {
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
    }

    if (userId && userId !== 'null' && userId !== 'undefined') {
      fetchEmails(userId);
    }
  }, []);

  const fetchEmails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/email/fetch-emails/${id}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
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
        <div className="logo">
          <div className="logo-icon"></div>
          <h2>MailFlow AI</h2>
        </div>
        <ul className="nav-links">
          <li className="active">
            <span className="icon">📊</span>
            <span>Overview</span>
          </li>
          <li>
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
              <span className="status-card-subtitle">28</span>
            </div>
            <span className="status-card-value">28</span>
          </div>
          
          <div className="status-card red-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">🔥</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">High Priority</span>
              <span className="status-card-subtitle">6</span>
            </div>
            <span className="status-card-value">6</span>
          </div>
          
          <div className="status-card blue-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">✉️</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">Pending Replies</span>
              <span className="status-card-subtitle">3</span>
            </div>
            <span className="status-card-value">3</span>
          </div>
          
          <div className="status-card green-glow">
            <div className="status-card-icon-container">
              <span className="status-card-icon">📅</span>
            </div>
            <div className="status-card-content">
              <span className="status-card-title">Scheduled...</span>
              <span className="status-card-subtitle">Meetings</span>
            </div>
            <span className="status-card-value">5</span>
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="recent-activity glass-panel">
            <div className="activity-header">
              <h2>Recent Activity</h2>
              <button className="btn-text">↻</button>
            </div>
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon blue">🤖</div>
                <div className="activity-details">
                  <h4>AI Generated Draft</h4>
                  <p>Replied to John Doe's inquiry about pricing.</p>
                </div>
                <span className="activity-time">2m ago</span>
              </li>
              <li className="activity-item">
                <div className="activity-icon purple">📥</div>
                <div className="activity-details">
                  <h4>New Lead Captured</h4>
                  <p>Sarah Smith from Acme Corp responded.</p>
                </div>
                <span className="activity-time">3h ago</span>
              </li>
              <li className="activity-item">
                <div className="activity-icon green">✨</div>
                <div className="activity-details">
                  <h4>Follow-up Sent</h4>
                  <p>Automated check-in with Tech Startups list.</p>
                </div>
                <span className="activity-time">5h ago</span>
              </li>
            </ul>
          </div>

          <div className="email-scroll glass-panel">
            <div className="activity-header">
              <h2>Current Emails</h2>
              <button 
                className="btn-text" 
                onClick={() => {
                  const id = localStorage.getItem('userId');
                  if (id) fetchEmails(id);
                }}
              >
                ↻
              </button>
            </div>
            <div className="email-list">
              {loading && <p style={{padding: '1rem'}}>Loading your emails...</p>}
              {error && <p style={{padding: '1rem', color: '#ef4444'}}>Error: {error}</p>}
              {!loading && !error && emails.length === 0 && (
                 <p style={{padding: '1rem'}}>No emails connected yet.</p>
              )}
              {!loading && !error && emails.map((email, i) => {
                const fromHeader = getHeader(email.headers, 'From');
                const subject = getHeader(email.headers, 'Subject') || "No Subject";
                const sender = formatSender(fromHeader);
                const initials = getInitials(sender);
                
                // Distinct colors for avatar styling
                const colors = ['#eab308', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];
                const avatarColor = colors[i % colors.length];

                return (
                  <div key={email.id} className="email-item">
                    <div className="email-avatar" style={{backgroundColor: avatarColor}}>{initials}</div>
                    <div className="email-content">
                      <div className="email-top">
                        <span className="email-sender">{sender}</span>
                        <span className="email-time">Recently</span>
                      </div>
                      <span className="email-subject">{subject}</span>
                      <p className="email-snippet" dangerouslySetInnerHTML={{ __html: email.snippet || "No preview available..." }}></p>
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
