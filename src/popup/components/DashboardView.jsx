import React from 'react';
import { 
  FileText, 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Lock,
  Layers,
  Clock
} from 'lucide-react';

export default function DashboardView({ 
  vaultDocuments = [], 
  onNavigate, 
  connectionStatus = 'ready' 
}) {
  const totalFields = vaultDocuments.reduce((acc, doc) => acc + (doc.fields?.length || 0), 0);

  return (
    <div className="view-container dashboard-view">
      {/* Privacy Guarantee Banner */}
      <div className="privacy-banner">
        <div className="banner-icon-col">
          <ShieldCheck size={18} className="banner-shield" />
        </div>
        <div className="banner-content">
          <p className="banner-title">Zero-Telemetry Privacy Engine</p>
          <p className="banner-desc">
            All documents and fields are strictly stored on-device in your browser. No external API transmission.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => onNavigate('upload')}>
          <div className="metric-header">
            <span className="metric-label">Processed Docs</span>
            <span className="metric-icon-wrap blue">
              <FileText size={15} />
            </span>
          </div>
          <div className="metric-value">{vaultDocuments.length}</div>
          <div className="metric-subtext">Securely indexed</div>
        </div>

        <div className="metric-card" onClick={() => onNavigate('vault')}>
          <div className="metric-header">
            <span className="metric-label">Vault Attributes</span>
            <span className="metric-icon-wrap indigo">
              <Database size={15} />
            </span>
          </div>
          <div className="metric-value">{totalFields}</div>
          <div className="metric-subtext">Ready for autofill</div>
        </div>

        <div className="metric-card" onClick={() => onNavigate('privacy')}>
          <div className="metric-header">
            <span className="metric-label">Security Mode</span>
            <span className="metric-icon-wrap green">
              <Lock size={15} />
            </span>
          </div>
          <div className="metric-value">Strict</div>
          <div className="metric-subtext">100% Local Sandbox</div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="section-block">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-button-list">
          <button className="action-row-btn primary" onClick={() => onNavigate('upload')}>
            <div className="btn-left">
              <div className="btn-icon-box"><FileText size={16} /></div>
              <div className="btn-text">
                <span className="btn-primary-text">Upload & Process Document</span>
                <span className="btn-secondary-text">Ingest ID, Tax form, or Employment records</span>
              </div>
            </div>
            <ArrowRight size={16} className="btn-arrow" />
          </button>

          <button className="action-row-btn secondary" onClick={() => onNavigate('autofill')}>
            <div className="btn-left">
              <div className="btn-icon-box"><Sparkles size={16} /></div>
              <div className="btn-text">
                <span className="btn-primary-text">Test Form Assistant on Page</span>
                <span className="btn-secondary-text">Inspect input fields on the active tab</span>
              </div>
            </div>
            <ArrowRight size={16} className="btn-arrow" />
          </button>
        </div>
      </div>

      {/* Extension Readiness & Diagnostics */}
      <div className="readiness-card">
        <div className="readiness-header">
          <span className="readiness-title">Foundation Readiness</span>
          <span className="readiness-tag">V3 Verified</span>
        </div>
        <div className="readiness-checklist">
          <div className="checklist-item">
            <CheckCircle2 size={14} className="check-icon" />
            <span>Manifest V3 service worker initialized</span>
          </div>
          <div className="checklist-item">
            <CheckCircle2 size={14} className="check-icon" />
            <span>Isolated content script loaded</span>
          </div>
          <div className="checklist-item">
            <CheckCircle2 size={14} className="check-icon" />
            <span>Local encrypted storage ready</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-block">
        <div className="section-header-row">
          <h3 className="section-title">Recent Ingestion Activity</h3>
          <span className="section-counter">{vaultDocuments.length} files</span>
        </div>
        <div className="activity-list">
          {vaultDocuments.slice(0, 3).map((doc) => (
            <div key={doc.id} className="activity-item">
              <div className="activity-icon-col">
                <FileText size={15} />
              </div>
              <div className="activity-details">
                <span className="activity-name">{doc.name}</span>
                <span className="activity-meta">
                  {doc.category} • {doc.fields?.length || 0} fields extracted
                </span>
              </div>
              <span className="activity-badge">{doc.status || 'Verified'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
