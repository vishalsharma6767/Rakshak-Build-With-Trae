const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

/**
 * @route   POST /simulate
 * @desc    Simulates a URL in a headless browser and returns behavioral data.
 * @access  Public
 */
app.post('/simulate', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    console.error('URL is required');
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log(`Starting simulation for URL: ${url}`);

  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
    });

    const page = await browser.newPage();
    console.log('Browser launched, new page created.');

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    const simulationData = {
      initialUrl: url,
      finalUrl: '',
      redirectChain: [],
      networkCalls: [],
      consoleMessages: [],
      dialogs: [],
      formSubmissions: [],
      iframes: [],
      scripts: [],
      pageHTML: '',
      screenshot: '',
    };

    // Track scripts
    page.on('response', async (response) => {
        const url = response.url();
        if (url.endsWith('.js') || response.headers()['content-type']?.includes('javascript')) {
            simulationData.scripts.push({
                url: url,
                status: response.status()
            });
        }
    });

    page.on('console', msg => {
      simulationData.consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    page.on('dialog', async dialog => {
      simulationData.dialogs.push({ type: dialog.type(), message: dialog.message() });
      await dialog.dismiss();
    });

    page.on('request', request => {
      if (request.isNavigationRequest()) {
        simulationData.redirectChain.push(request.url());
      }
    });

    page.on('response', async response => {
      const request = response.request();
      simulationData.networkCalls.push({
        url: request.url(),
        method: request.method(),
        status: response.status(),
        contentType: response.headers()['content-type'],
      });
    });

    page.on('frameattached', frame => {
        simulationData.iframes.push(frame.url());
    });

    console.log('Navigating to URL...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    console.log('Navigation complete.');

    await page.evaluate(() => {
        for (const form of document.forms) {
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const formDetails = { action: form.action, method: form.method, fields: {} };
                for (const [name, value] of formData.entries()) {
                    formDetails.fields[name] = value;
                }
                simulationData.formSubmissions.push(formDetails);
            });
        }
    });

    simulationData.finalUrl = page.url();
    simulationData.pageHTML = await page.content();
    simulationData.screenshot = await page.screenshot({ encoding: 'base64' });

    console.log('Simulation finished, sending data.');
    res.json(simulationData);

  } catch (error) {
    console.error(`Error during simulation for ${url}:`, error);
    res.status(500).json({ error: 'Simulation failed', details: error.message });
  } finally {
    if (browser) {
      console.log('Closing browser.');
      await browser.close();
    }
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Sandbox server running on port ${PORT}`);
});
