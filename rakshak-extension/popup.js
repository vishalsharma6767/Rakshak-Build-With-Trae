document.addEventListener('DOMContentLoaded', async () => {
  const scoreBadge = document.getElementById('scoreBadge');
  const summaryCard = document.getElementById('summaryCard');
  const summaryText = document.getElementById('summaryText');
  const safeIndicator = document.getElementById('safeIndicator');
  const ignoreBtn = document.getElementById('ignoreBtn');
  const reportBtn = document.getElementById('reportBtn');

  // Get the current active tab URL
  let currentUrl = '';
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs && tabs[0] && tabs[0].url) {
      currentUrl = tabs[0].url;
    }
  } catch (e) {
    console.error('Could not get active tab:', e);
  }

  // Fallback if no tab URL available
  if (!currentUrl) {
    currentUrl = 'https://example.com';
  }

  try {
    const response = await fetch('https://bd2d3aa6-af33-4509-aec3-d24ff5ba8eaf.netlify.app/analyze-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: currentUrl }),
    });

    const data = await response.json();
    const riskScore = data.risk_score || 50;
    const verdict = data.verdict || 'SUSPICIOUS';
    const aiSummary = data.ai_summary || 'We could not fully analyze this link.';
    const top3Verdicts = data.top_3_verdicts || ['Unknown Link', 'Potential Phishing', 'Safe Page'];

    // Update UI based on risk score
    if (riskScore > 40) {
      // UNSAFE - Show blocking UI
      scoreBadge.textContent = `Risk: ${riskScore}%`;
      scoreBadge.className = 'score-badge';
      scoreBadge.classList.add(verdict.toLowerCase());

      summaryCard.style.display = 'block';
      summaryText.textContent = aiSummary;

      safeIndicator.style.display = 'none';
      summaryCard.style.borderLeftColor = '#dc3545';

      // Show action buttons
      ignoreBtn.style.display = 'inline-block';
      reportBtn.style.display = 'inline-block';

      // Add pulsating animation to indicate danger
      scoreBadge.style.animation = 'pulse 1s infinite';
    } else {
      // SAFE - Show safe indicator
      scoreBadge.textContent = `Safe: ${riskScore}%`;
      scoreBadge.className = 'score-badge safe';
      scoreBadge.style.animation = 'none';

      summaryCard.style.display = 'none';
      safeIndicator.style.display = 'block';

      // Hide action buttons
      ignoreBtn.style.display = 'none';
      reportBtn.style.display = 'none';

      // Remove any danger animation
      scoreBadge.style.animation = 'none';
    }

  } catch (error) {
    // Fallback if API call fails
    console.error('Rakshak API error:', error);

    scoreBadge.textContent = 'Error checking link';
    scoreBadge.style.color = '#6c757d';
    scoreBadge.style.background = '#f8f9fa';
    scoreBadge.style.animation = 'none';

    summaryCard.style.display = 'none';
    safeIndicator.style.display = 'block';
    safeIndicator.querySelector('span').textContent = 'Could not connect to Rakshak service. Proceeding with caution.';
    safeIndicator.style.background = '#fff3cd';
    safeIndicator.style.borderColor = '#ffeeba';
    safeIndicator.style.color = '#856404';

    ignoreBtn.style.display = 'inline-block';
    reportBtn.style.display = 'inline-block';
  }

  // Ignore button - allow user to proceed to the site
  ignoreBtn.addEventListener('click', () => {
    chrome.storage.local.set({ [currentUrl]: { blocked: false, riskScore: 0 } }, () => {
      window.close();
    });
  });

  // Report button - open full Rakshak report
  reportBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://rakshak-platform.com/report' }, () => {
      window.close();
    });
  });
});