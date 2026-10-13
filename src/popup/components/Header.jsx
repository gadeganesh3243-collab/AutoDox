import React from 'react';
import { ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function Header({ onOpenOptions }) {
  return (
    <header className="popup-header">
      <div className="brand-group">
        <div className="brand-icon-wrapper">
          <ShieldCheck className="brand-shield-icon" size={20} />
          <span className="brand-sparkle-dot"></span>
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <h1 className="brand-title">AutoDox AI</h1>
            <span className="brand-badge">FOUNDATION V1</span>
          </div>
          <p className="brand-subtitle">Document Processing & Autofill</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="status-indicator" title="Safe Mode: Local Only">
          <span className="status-dot"></span>
          <span className="status-label">Active</span>
        </div>
        {onOpenOptions && (
          <button 
            className="options-button" 
            onClick={onOpenOptions} 
            title="Open Extension Settings"
            aria-label="Settings"
          >
            <ExternalLink size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
