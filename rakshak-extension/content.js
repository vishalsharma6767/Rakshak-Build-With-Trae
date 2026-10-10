document.addEventListener('DOMContentLoaded', async () => {
  const currentUrl = window.location.href;

  // Skip if it's a chrome extension or internal page
  if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('about:')) {
    return;
  }

  try {
    // Send message to background script to analyze the URL
    const response = await chrome.runtime.sendMessage({
      type: 'analyze-url',
      url: currentUrl
    });

    if (response && response.riskScore !== undefined) {
      const riskScore = response.riskScore;
      const verdict = response.verdict || 'UNKNOWN';

      // Create a subtle safety indicator in the page
      const existingIndicator = document.getElementById('rakshak-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }

      const indicator = document.createElement('div');
      indicator.id = 'rakshak-indicator';
      indicator.style.position = 'fixed';
      indicator.style.top = '20px';
      indicator.style.right = '20px';
      indicator.style.zIndex = '999999';
      indicator.style.padding = '12px 20px';
      indicator.style.borderRadius = '8px';
      indicator.style.fontFamily = 'Segoe UI, system-ui, -apple-system, sans-serif';
      indicator.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

      if (riskScore > 40) {
        // UNSAFE - Red indicator with blocking warning
        indicator.style.background = 'linear-gradient(135deg, #ff6b35, #febc2e)';
        indicator.style.color = 'white';
        indicator.style.fontWeight = '600';
        indicator.style.boxShadow = '0 4px 16px rgba(255, 107, 53, 0.4)';
        indicator.innerHTML = `
          <strong>Rakshak Warning</strong><br>
          <span style="font-size: 14px; opacity: 0.9;">Risk Score: ${riskScore}%</span><br>
          <span style="font-size: 12px; opacity: 0.8; margin-top: 4px;">This link has been flagged as potentially unsafe.</span>
        `;
      } else {
        // SAFE - Green indicator
        indicator.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        indicator.style.color = 'white';
        indicator.style.fontWeight = '500';
        indicator.style.boxShadow = '0 4px 16px rgba(40, 167, 69, 0.4)';
        indicator.innerHTML = `
          <strong>Rakshak Safe</strong><br>
          <span style="font-size: 14px; opacity: 0.9;">Risk Score: ${riskScore}%</span><br>
          <span style="font-size: 12px; opacity: 0.8; margin-top: 4px;">This link appears to be safe.</span>
        `;
      }

      // Add click handler to show popup
      indicator.style.cursor = 'pointer';
      indicator.style.transition = 'background 0.3s ease';
      indicator.addEventListener('mouseenter', () => {
        indicator.style.background = riskScore > 40 
          ? 'linear-gradient(135deg, #dc3545, #e74c3c)' 
          : 'linear-gradient(135deg, #218838, #17a2b8)';
      });
      indicator.addEventListener('mouseleave', () => {
        indicator.style.background = riskScore > 40
          ? 'linear-gradient(135deg, #ff6b35, #febc2e)' 
          : 'linear-gradient(135deg, #28a745, #20c997)';
      });

      indicator.addEventListener('click', async () => {
        // Open the popup
        chrome.action.openPopup();
      });

      document.body.appendChild(indicator);
    }
  } catch (error) {
    console.error('Rakshak content script error:', error);
  }
});

// Listen for tab updates and re-analyze
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const tabInfo = await chrome.tabs.get(tabId);
    if (tabInfo.url && !tabInfo.url.startsWith('chrome://')) {
      try {
        await chrome.runtime.sendMessage({
          type: 'analyze-url',
          url: tabInfo.url
        });
      } catch (e) {
        console.log('Could not re-analyze on tab update');
      }
    }
  }
});