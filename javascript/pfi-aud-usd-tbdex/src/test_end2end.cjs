const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const filePath = path.join(__dirname, '../src/didpay-client/index.html');
  const fileUrl = `file://${filePath}`;

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait for offerings to load
  await page.waitForSelector('#offeringsContainer > div');

  // Check if offerings loaded at the top
  const offeringsLoaded = await page.evaluate(() => {
    const offeringsContainer = document.querySelector('#offeringsContainer');
    return offeringsContainer.firstElementChild !== null;
  });

  if (offeringsLoaded) {
    console.log('Offerings loaded successfully');
    process.exit(0);
  } else {
    console.error('Offerings failed to load');
    process.exit(1);
  }

  await browser.close();
})();