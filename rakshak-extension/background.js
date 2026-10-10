chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'analyze-url') {
    const url = request.url;
    const currentTab = sender.tab;

    try {
      // Call the Rakshak backend API
      const backendUrl = 'https://bd2d3aa6-af33-4509-aec3-d24ff5ba8eaf.netlify.app/analyze-url';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const data = await response.json();
      const riskScore = data.risk_score || 50;
      const verdict = data.verdict || 'SUSPICIOUS';
      const aiSummary = data.ai_summary || 'We could not fully analyze this link.';

      // Block if risk_score > 40
      const isBlocked = riskScore > 40;

      sendResponse({
        riskScore,
        verdict,
        aiSummary,
        isBlocked,
        url
      });

      // If link is blocked, we can prevent navigation here
      // but per requirements, we show popup and let user click "Ignore"
      if (isBlocked && currentTab) {
        // Don't block automatically - show popup instead
        console.log('Link blocked by risk score, showing popup');
      }

    } catch (error) {
      console.error('Rakshak backend error:', error);

      // Fallback: treat as suspicious if API fails
      sendResponse({
        riskScore: 50,
        verdict: 'SUSPICIOUS',
        aiSummary: 'Could not connect to Rakshak analysis service. Proceed with caution.',
        isBlocked: true,
        url
      });
    }
  }

  // Important: return true to keep message channel open for async response
  return true;
});