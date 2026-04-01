import React from "react";
import { useNavigate } from "react-router-dom";
import "./Leads.css";

const Leads = () => {
  const navigate = useNavigate();

  const leads = [
    {
      id: 1,
      company: "Acme Corp",
      priority: "High Priority",
      contact: "David Miller",
      email: "david@acmecorp.com",
      role: "CEO",
      intent: "Interested in Product Demo for 50-person Fintech Team",
      lastMessage: "Hi, we're evaluating tools for our 50-person fintech team, and would love to book a demo this week...",
      tags: ["Product Demo", "Fintech", "50+ Employees"],
      score: 85,
      time: "1 hour ago",
      size: "Company size",
      period: "This Week",
      status: "view_details"
    },
    {
      id: 2,
      company: "InnovateTech",
      priority: "High Priority",
      contact: "Sarah Johnson",
      email: "sarah@innovatetech.io",
      role: "Sales Director",
      intent: "Partnership Opportunity - Enterprise Pricing",
      lastMessage: "We are looking for a long-term partnership and need pricing details for our enterprise plan...",
      tags: ["Partnership", "Enterprise"],
      score: 80,
      time: "3 hours ago",
      size: "200",
      period: "This Month",
      status: "view_details"
    },
    {
      id: 3,
      company: "NextGen Solutions",
      priority: "High Priority",
      contact: "Michael Chen",
      email: "michael@nextgen.com", // Added dummy email
      role: "Founder",
      intent: "Can we schedule a call next week?",
      lastMessage: "Saw your product online. We're interested in learning more. Can we set up a quick call?",
      tags: ["Demo Call", "SaaS", "Follow-up"],
      score: 78,
      time: "3 hours ago",
      size: "18",
      period: "Next Week",
      status: "schedule_meeting"
    },
    {
      id: 4,
      company: "CodeWave",
      priority: "Medium",
      contact: "Lisa Patel",
      email: "lisa.p@codewave.dev",
      role: "CTO",
      intent: "Collaboration on Developer Tools",
      lastMessage: "We're building developer tools and would love to explore potential collaboration...",
      tags: ["Collaboration", "DevTools"],
      score: 62,
      time: "1 day ago",
      size: "25",
      period: "This Quarter",
      status: "create_draft"
    },
    {
      id: 5,
      company: "Flux Industries",
      priority: "Low",
      contact: "John Doe", // Added dummy contact
      email: "john@flux.com", // Added dummy email
      role: "Manager",
      intent: "Inquiry about Services",
      lastMessage: "Just reaching out to ask about your service offerings for next year...",
      tags: ["Inquiry"],
      score: 45,
      time: "2 days ago",
      size: "100+",
      period: "Next Year",
      status: "view_details"
    }
  ];

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
                <span className="metric-value">28</span>
                <span className="metric-change positive">+12 this week</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon red-bg">🔥</div>
            <div className="metric-info">
              <span className="metric-label">High Priority</span>
              <div className="metric-value-row">
                <span className="metric-value">6</span>
                <span className="metric-change p-text">21% of total</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon brown-bg">💬</div>
            <div className="metric-info">
              <span className="metric-label">Pending Replies</span>
              <div className="metric-value-row">
                <span className="metric-value">3</span>
                <span className="metric-change">Awaiting action</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon green-bg">📅</div>
            <div className="metric-info">
              <span className="metric-label">Scheduled Meetings</span>
              <div className="metric-value-row">
                <span className="metric-value">5</span>
                <span className="metric-change">This week</span>
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
                  <div className={`lead-avatar ${lead.company.toLowerCase().replace(" ", "-")}`}>
                    {lead.company[0]}
                  </div>
                </div>
                <div className="lead-details">
                  <div className="lead-header">
                    <h3>{lead.company}</h3>
                    <span className={`priority-tag ${lead.priority.toLowerCase().replace(" ", "-")}`}>
                      {lead.priority === "High Priority" && <span className="icon">⚡</span>}
                      {lead.priority}
                    </span>
                  </div>
                  <div className="contact-info">
                    <span>👤 {lead.contact}</span>
                    <span className="dot">•</span>
                    <span>{lead.email}</span>
                    <span className="dot">•</span>
                    <span>{lead.role}</span>
                  </div>
                  <div className="intent-section">
                    <div className="intent-title">
                      <span className="icon">✉️</span>
                      <strong>{lead.intent}</strong>
                    </div>
                    <p className="intent-preview">{lead.lastMessage}</p>
                    <div className="tags">
                      {lead.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
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
                      <span>{lead.time}</span>
                    </div>
                    <div className="stat-row">
                      <span className="icon">🏢</span>
                      <span>{lead.size}</span>
                    </div>
                    <div className="stat-row">
                      <span className="icon">📅</span>
                      <span>{lead.period}</span>
                    </div>
                  </div>
                </div>
                <div className="lead-actions">
                  <span className="score-label">Score</span>
                  <div className="score-mini-bar">
                     <div className="score-mini-fill" style={{ width: `${lead.score}%`, backgroundColor: lead.score > 70 ? '#f97316' : lead.score > 50 ? '#eab308' : '#3b82f6' }}></div>
                  </div>
                  <button className="btn-secondary">👁️ View Details</button>
                  {lead.status === "schedule_meeting" ? (
                    <button className="btn-action-green">📅 Schedule Meeting</button>
                  ) : lead.status === "create_draft" ? (
                    <button className="btn-secondary">+ Create Draft</button>
                  ) : (
                    <button className="btn-secondary">✏️ Edit Draft</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <footer className="pagination-footer">
          <div className="leads-count">Showing 1 - 5 of 28 leads</div>
          <div className="pagination-controls">
            <button className="page-btn">{"<"}</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn">6</button>
            <button className="page-btn">{">"}</button>
          </div>
          <div className="rows-per-page">
            <span>Rows per page:</span>
            <select><option>5</option></select>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Leads;
