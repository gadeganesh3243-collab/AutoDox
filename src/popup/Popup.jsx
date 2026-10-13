import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import UploadView from './components/UploadView';
import VaultView from './components/VaultView';
import AutofillAssistantView from './components/AutofillAssistantView';
import PrivacySettingsView from './components/PrivacySettingsView';
import { storage } from '../utils/storage';
import './Popup.css';

export default function Popup() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vaultDocuments, setVaultDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load vault data on startup
  useEffect(() => {
    async function loadData() {
      try {
        const res = await storage.get(['autodox_vault']);
        if (res.autodox_vault && Array.isArray(res.autodox_vault)) {
          setVaultDocuments(res.autodox_vault);
        } else {
          // Default initial items
          const initialDocs = [
            {
              id: 'doc-sample-1',
              name: 'Passport_Alex_Morgan.pdf',
              category: 'Identity & Passport',
              uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              size: '1.4 MB',
              status: 'Verified (Local)',
              fields: [
                { label: 'Full Legal Name', key: 'fullName', value: 'Alex Morgan', category: 'Personal' },
                { label: 'Nationality', key: 'nationality', value: 'United States', category: 'Personal' },
                { label: 'Document Number', key: 'docNumber', value: 'P98421094', category: 'Identity' }
              ]
            },
            {
              id: 'doc-sample-2',
              name: 'W2_Tax_Summary_2025.pdf',
              category: 'Tax & Financial (W-2, 1099)',
              uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              size: '840 KB',
              status: 'Verified (Local)',
              fields: [
                { label: 'Employer Name', key: 'employer', value: 'Acme Technologies Inc.', category: 'Professional' },
                { label: 'Postal Address', key: 'address', value: '742 Evergreen Terrace, Springfield, OR', category: 'Contact' },
                { label: 'Phone Number', key: 'phone', value: '+1 (555) 019-2834', category: 'Contact' }
              ]
            }
          ];
          setVaultDocuments(initialDocs);
          await storage.set({ autodox_vault: initialDocs });
        }
      } catch (err) {
        console.error('Failed to load storage:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync back to storage when vault changes
  const updateVault = async (newDocs) => {
    setVaultDocuments(newDocs);
    await storage.set({ autodox_vault: newDocs });
  };

  const handleAddDocument = (newDoc) => {
    const updated = [newDoc, ...vaultDocuments];
    updateVault(updated);
  };

  const handleDeleteDocument = (docId) => {
    const updated = vaultDocuments.filter((d) => d.id !== docId);
    updateVault(updated);
  };

  const handleAddField = (newField) => {
    if (vaultDocuments.length === 0) {
      const customDoc = {
        id: `doc-${Date.now()}`,
        name: 'Custom_Attributes.json',
        category: 'Custom Document',
        uploadedAt: new Date().toISOString(),
        size: '12 KB',
        status: 'Local',
        fields: [newField]
      };
      updateVault([customDoc]);
    } else {
      const targetDoc = { ...vaultDocuments[0] };
      targetDoc.fields = [...(targetDoc.fields || []), newField];
      const updated = [targetDoc, ...vaultDocuments.slice(1)];
      updateVault(updated);
    }
  };

  const handleResetVault = () => {
    updateVault([]);
  };

  const handleOpenOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  const totalFields = vaultDocuments.reduce((acc, d) => acc + (d.fields?.length || 0), 0);

  return (
    <div className="popup-app-wrapper">
      <Header onOpenOptions={handleOpenOptions} />

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        docCount={vaultDocuments.length}
        fieldCount={totalFields}
      />

      <main className="popup-content-area">
        {activeTab === 'dashboard' && (
          <DashboardView 
            vaultDocuments={vaultDocuments} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'upload' && (
          <UploadView 
            vaultDocuments={vaultDocuments} 
            onAddDocument={handleAddDocument} 
            onDeleteDocument={handleDeleteDocument} 
          />
        )}
        {activeTab === 'vault' && (
          <VaultView 
            vaultDocuments={vaultDocuments} 
            onAddField={handleAddField} 
          />
        )}
        {activeTab === 'autofill' && (
          <AutofillAssistantView vaultDocuments={vaultDocuments} />
        )}
        {activeTab === 'privacy' && (
          <PrivacySettingsView 
            vaultDocuments={vaultDocuments} 
            onResetVault={handleResetVault} 
          />
        )}
      </main>

      <footer className="popup-footer">
        <span className="footer-safe-badge">Local Encryption Active</span>
        <span className="footer-version">v1.0.0 Foundation</span>
      </footer>
    </div>
  );
}
