import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw,
  SearchCode
} from 'lucide-react';

export default function AutofillAssistantView() {
  const [activeTabInfo, setActiveTabInfo] = useState({ title: '', url: '', domain: 'Current Webpage' });
  const [contentScriptStatus, setContentScriptStatus] = useState('checking'); // checking | connected | standby
  const [formFieldInspection, setFormFieldInspection] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Assistant safety toggles
  const [requireConfirm, setRequireConfirm] = useState(true);
  const [highlightInputs, setHighlightInputs] = useState(true);
  const [excludeSensitive, setExcludeSensitive] = useState(true);

  // Check connection to active tab
  const checkActiveTabConnection = () => {
    setContentScriptStatus('checking');

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          setContentScriptStatus('standby');
          return;
        }

        const tab = tabs[0];
        try {
          const domain = new URL(tab.url || '').hostname;
          setActiveTabInfo({ title: tab.title || 'Tab', url: tab.url, domain });
        } catch (e) {
          setActiveTabInfo({ title: 'Current Tab', url: '', domain: 'Active Tab' });
        }

        // Send ping to content script
        chrome.tabs.sendMessage(tab.id, { type: 'AUTODOX_PING' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            setContentScriptStatus('standby');
          } else {
            setContentScriptStatus('connected');
          }
        });
      });
    } else {
      // Mock for browser testing
      setActiveTabInfo({ title: 'Application Form Demo', url: '', domain: 'example.com' });
      setContentScriptStatus('connected');
    }
  };

  useEffect(() => {
    checkActiveTabConnection();
  }, []);

  const handleTestFieldInspection = () => {
    setIsInspecting(true);

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          setIsInspecting(false);
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { type: 'AUTODOX_INSPECT_FORM_FIELDS' }, (response) => {
          setIsInspecting(false);
          if (chrome.runtime.lastError || !response) {
            setFormFieldInspection({ count: 0, error: 'Content script not injected or page restricted.' });
          } else {
            setFormFieldInspection(response);
          }
        });
      });
    } else {
      setTimeout(() => {
        setIsInspecting(false);
        setFormFieldInspection({
          status: 'SUCCESS',
          count: 5,
          fieldsSummary: [
            { id: 'f_name', name: 'firstName', placeholder: 'First Name', type: 'text' },
            { id: 'l_name', name: 'lastName', placeholder: 'Last Name', type: 'text' },
            { id: 'u_email', name: 'email', placeholder: 'Email Address', type: 'email' },
            { id: 'u_addr', name: 'address', placeholder: 'Street Address', type: 'text' },
            { id: 'u_phone', name: 'phone', placeholder: 'Phone Number', type: 'tel' }
          ]
        });
      }, 500);
    }
  };

  return (
    <div className="view-container autofill-view">
      {/* Active Tab Card */}
      <div className="active-tab-card">
        <div className="active-tab-header">
          <div className="tab-origin-row">
            <Globe size={15} className="globe-icon" />
            <span className="domain-label">{activeTabInfo.domain}</span>
          </div>
          <button 
            className="refresh-tab-btn" 
            onClick={checkActiveTabConnection}
            title="Refresh Tab Connection"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="connection-status-row">
          {contentScriptStatus === 'connected' ? (
            <div className="status-badge connected">
              <CheckCircle2 size={13} />
              <span>Isolated Content Script: Connected</span>
            </div>
          ) : contentScriptStatus === 'checking' ? (
            <div className="status-badge pending">
              <span>Checking connection...</span>
            </div>
          ) : (
            <div className="status-badge standby">
              <AlertCircle size={13} />
              <span>Standby (Navigate to an HTTP/HTTPS page)</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Form Detection Button */}
      <div className="test-assistant-card">
        <div className="assistant-card-body">
          <div className="assistant-title-row">
            <SearchCode size={18} className="assistant-spark-icon" />
            <span className="card-subtitle-bold">Form Input Inspection</span>
          </div>
          <p className="card-explainer">
            Safely queries the active page for interactive input fields without harvesting user data.
          </p>
          <button 
            className="inspect-btn-primary"
            onClick={handleTestFieldInspection}
            disabled={isInspecting}
          >
            {isInspecting ? 'Inspecting page inputs...' : 'Inspect Page Form Fields'}
          </button>
        </div>

        {formFieldInspection && (
          <div className="inspection-result-box">
            <div className="result-header">
              <span className="result-count">
                Detected <strong>{formFieldInspection.count || 0}</strong> interactive field(s)
              </span>
              <span className="privacy-pill">Safe Mode</span>
            </div>
            {formFieldInspection.fieldsSummary && formFieldInspection.fieldsSummary.length > 0 && (
              <div className="field-chips-wrap">
                {formFieldInspection.fieldsSummary.map((f, i) => (
                  <span key={i} className="field-chip">
                    {f.placeholder || f.name || f.id} ({f.type})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety & Confirmation Controls */}
      <div className="section-block">
        <h3 className="section-title">Autofill Safety Policies</h3>
        
        <div className="toggle-setting-row">
          <div className="setting-label-col">
            <span className="setting-main-label">Require Confirmation Before Fill</span>
            <span className="setting-sub-label">Preview values before writing to inputs</span>
          </div>
          <button 
            className={`toggle-switch ${requireConfirm ? 'active' : ''}`}
            onClick={() => setRequireConfirm(!requireConfirm)}
          >
            {requireConfirm ? <ToggleRight size={24} className="toggle-on" /> : <ToggleLeft size={24} className="toggle-off" />}
          </button>
        </div>

        <div className="toggle-setting-row">
          <div className="setting-label-col">
            <span className="setting-main-label">Highlight Matched Fields</span>
            <span className="setting-sub-label">Visual blue outline on detected fields</span>
          </div>
          <button 
            className={`toggle-switch ${highlightInputs ? 'active' : ''}`}
            onClick={() => setHighlightInputs(!highlightInputs)}
          >
            {highlightInputs ? <ToggleRight size={24} className="toggle-on" /> : <ToggleLeft size={24} className="toggle-off" />}
          </button>
        </div>

        <div className="toggle-setting-row">
          <div className="setting-label-col">
            <span className="setting-main-label">Protect Sensitive Financial Fields</span>
            <span className="setting-sub-label">Block automatic entry of CVV and card numbers</span>
          </div>
          <button 
            className={`toggle-switch ${excludeSensitive ? 'active' : ''}`}
            onClick={() => setExcludeSensitive(!excludeSensitive)}
          >
            {excludeSensitive ? <ToggleRight size={24} className="toggle-on" /> : <ToggleLeft size={24} className="toggle-off" />}
          </button>
        </div>
      </div>
    </div>
  );
}
