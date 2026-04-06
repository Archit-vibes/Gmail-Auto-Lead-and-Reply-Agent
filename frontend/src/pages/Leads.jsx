import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Leads.css";

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("http://localhost:8000/leads");
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Metrics calculation
  const totalLeads = leads.length;
  const highPriorityCount = leads.filter(l => l.priority === "High").length;
  const pendingReplies = leads.filter(l => l.status === "Fetched" || l.status === "new").length;
  const scheduledMeetings = leads.filter(l => l.event).length;

  const getInitials = (name) => {
    if (!name) return "?";
    return name[0].toUpperCase();
  };

  const formatSender = (sender) => {
    if (!sender) return "Unknown Sender";
    const nameMatch = sender.match(/^"?(.*?)"?\s*<.*>$/);
    return nameMatch ? nameMatch[1] : sender;
  };

  const formatEmail = (sender) => {
    if (!sender) return "";
    const emailMatch = sender.match(/<(.*?)>/);
    return emailMatch ? emailMatch[1] : sender;
  };

  if (loading) {
    return <div className="loading-container">Loading Leads...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="logo" onClick={() => navigate("/dashboard")}>
          <div className="logo-icon"></div>
          <h2>MailFlow AI</h2>
        </div>
        <ul className="nav-links">
          <li onClick={() => navigate("/dashboard")}>
            <span className="icon">📊</span>
            <span>Overview</span>
          </li>
          <li className="active">
            <span className="icon">👥</span>
            <span>Leads</span>
          </li>
          <li>
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Archit" alt="User" />
            <div className="user-info">
              <span className="user-name">Archit</span>
              <span className="user-email">kuroiskun@gmail.com</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1>Leads</h1>
            <p>Manage and take action on your sales leads</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search leads, companies, or senders..." />
              <span className="search-shortcut">ctrl / ⌘ + k</span>
            </div>
            <button className="btn-primary">+ New Lead</button>
          </div>
        </header>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon purple-bg">👤</div>
            <div className="metric-info">
              <span className="metric-label">Total Leads</span>
              <div className="metric-value-row">
                <span className="metric-value">{totalLeads}</span>
                <span className="metric-change positive">Active in system</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon red-bg">🔥</div>
            <div className="metric-info">
              <span className="metric-label">High Priority</span>
              <div className="metric-value-row">
                <span className="metric-value">{highPriorityCount}</span>
                <span className="metric-change p-text">Requires attention</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon brown-bg">💬</div>
            <div className="metric-info">
              <span className="metric-label">Pending Action</span>
              <div className="metric-value-row">
                <span className="metric-value">{pendingReplies}</span>
                <span className="metric-change">Awaiting reply</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon green-bg">📅</div>
            <div className="metric-info">
              <span className="metric-label">Meetings</span>
              <div className="metric-value-row">
                <span className="metric-value">{scheduledMeetings}</span>
                <span className="metric-change">Upcoming</span>
              </div>
            </div>
          </div>
        </section>

        <section className="filter-bar">
          <div className="filter-group">
            <select><option>All Priorities</option></select>
            <select><option>All Intents</option></select>
            <select><option>All Statuses</option></select>
            <select><option>Last 7 Days</option></select>
          </div>
          <div className="filter-actions">
            <button className="btn-clear">Clear</button>
            <button className="btn-apply">Apply Filters</button>
          </div>
        </section>

        <section className="leads-list">
          {leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div className="lead-main">
                <div className="lead-avatar-container">
                  <div className={`lead-avatar ${lead.company?.toLowerCase().replace(" ", "-") || "default"}`}>
                    {getInitials(lead.company)}
                  </div>
                </div>
                <div className="lead-details">
                  <div className="lead-header">
                    <h3>{lead.company || "Unknown Company"}</h3>
                    <span className={`priority-tag ${lead.priority?.toLowerCase() || "low"}`}>
                      {lead.priority === "High" && <span className="icon">⚡</span>}
                      {lead.priority} Priority
                    </span>
                  </div>
                  <div className="contact-info">
                    <span>👤 {formatSender(lead.email.sender)}</span>
                    <span className="dot">•</span>
                    <span>{formatEmail(lead.email.sender)}</span>
                    <span className="dot">•</span>
                    <span>{lead.industry || "General Industry"}</span>
                  </div>
                  <div className="intent-section">
                    <div className="intent-title">
                      <span className="icon">✉️</span>
                      <strong>{lead.intent}</strong>
                    </div>
                    <p className="intent-preview">
                      {lead.email.body.length > 150 ? lead.email.body.substring(0, 150) + "..." : lead.email.body}
                    </p>
                    <div className="tags">
                      {lead.industry && <span className="tag">{lead.industry}</span>}
                      <span className="tag">{lead.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lead-stats">
                <div className="score-section">
                  <div className="score-value">
                    <span className="big-score">{lead.score}</span>
                    <span className="score-total">/100</span>
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${lead.score}%`, backgroundColor: lead.score > 70 ? '#f97316' : lead.score > 50 ? '#eab308' : '#3b82f6' }}></div>
                    </div>
                  </div>
                  <div className="stat-rows">
                    <div className="stat-row">
                      <span className="icon">🕒</span>
                      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="stat-row">
                      <span className="icon">🏢</span>
                      <span>{lead.industry || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div className="lead-actions">
                  <span className="score-label">Interest Score</span>
                  <div className="score-mini-bar">
                     <div className="score-mini-fill" style={{ width: `${lead.score}%`, backgroundColor: lead.score > 70 ? '#f97316' : lead.score > 50 ? '#eab308' : '#3b82f6' }}></div>
                  </div>
                  <button className="btn-secondary">👁️ View Details</button>
                  {lead.event ? (
                    <button className="btn-action-green">📅 Meeting Scheduled</button>
                  ) : (
                    <button className="btn-secondary">✏️ Draft Reply</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <div className="no-leads">
              <p>No leads found. Try fetching some emails!</p>
            </div>
          )}
        </section>

        <footer className="pagination-footer">
          <div className="leads-count">Showing {leads.length} leads</div>
          <div className="pagination-controls">
            <button className="page-btn">{"<"}</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">{">"}</button>
          </div>
          <div className="rows-per-page">
            <span>Rows per page:</span>
            <select><option>{leads.length || 10}</option></select>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Leads;
