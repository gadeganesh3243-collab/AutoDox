/**
 * AutoDox AI - Content Script
 *
 * Privacy Guarantees:
 * 1. Strictly isolated execution.
 * 2. Does NOT automatically inspect, harvest, or transmit webpage contents.
 * 3. Only responds to explicit user actions initiated from the AutoDox AI popup.
 */

(function () {
  console.log('[AutoDox AI] Content script active (Privacy-First Standby Mode)');

  // Listen for explicit commands from extension popup / background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1. Connection Healthcheck / Ping
    if (request.type === 'AUTODOX_PING') {
      sendResponse({
        status: 'READY',
        pageTitle: document.title || 'Untitled Page',
        origin: window.location.origin,
        isolated: true,
        privacyMode: 'STRICT_STANDBY'
      });
      return true;
    }

    // 2. Safe Form Inspection (counts visible input elements without extracting user data)
    if (request.type === 'AUTODOX_INSPECT_FORM_FIELDS') {
      try {
        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));
        const detectedFields = inputs.map((el, index) => {
          return {
            id: el.id || `field_${index}`,
            name: el.name || '',
            placeholder: el.placeholder || '',
            type: el.type || el.tagName.toLowerCase(),
            ariaLabel: el.getAttribute('aria-label') || ''
          };
        });

        sendResponse({
          status: 'SUCCESS',
          count: detectedFields.length,
          fieldsSummary: detectedFields.slice(0, 10) // Preview top 10 fields only
        });
      } catch (err) {
        sendResponse({
          status: 'ERROR',
          message: err.message
        });
      }
      return true;
    }

    return false;
  });
})();
