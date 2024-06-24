import { chromium } from 'playwright';
import cliProgress from 'cli-progress';
import ora from 'ora';
import fs from 'fs';
import readlineSync from 'readline-sync';

// Demande les options à l'utilisateur
const getUserOptions = () => {
  const maxTimeInput = readlineSync.question('Enter maximum runtime in minutes (leave empty for no limit): ');
  const maxTimeMinutes = maxTimeInput ? parseInt(maxTimeInput, 10) : null;
  const headlessInput = readlineSync.question('Do you want to run the browser without seeing it? (y/n): ').toLowerCase();
  const headless = headlessInput === 'y';
  const closeBrowserInput = readlineSync.question('Do you want to close the browser at the end? (y/n): ').toLowerCase();
  const closeBrowser = closeBrowserInput === 'y';
  return { maxTimeMinutes, headless, closeBrowser };
};

const { maxTimeMinutes, headless, closeBrowser } = getUserOptions();

(async () => {
  const startTime = Date.now();
  const spinner = ora('Launching browser...').start();
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  spinner.text = 'Navigating to Storyset...';
  await page.goto('https://storyset.com/', { waitUntil: 'load' });

  spinner.text = 'Analyzing the site for illustrations...';

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(100, 0);

  const styles = ['rafiki', 'bro', 'amico', 'pana', 'cuate'];
  let totalHeight = 0;
  const distance = 1000;
  let illustrationData = new Set();
  let previousHeight = 0;

  while (true) {
    previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // Attendre 2 secondes pour que la nouvelle section se charge

    // Récupérer les nouvelles données des illustrations
    const newLinks = await page.evaluate((styles) => {
      return Array.from(document.querySelectorAll('.svg-container + script[type="application/ld+json"]')).map(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          const style = styles.find(s => data.thumbnailUrl?.toLowerCase().includes(s)) || 'unknown';
          if (data.contentUrl && data.name) {
            return {
              contentUrl: data.contentUrl,
              title: data.name,
              style: style,
              createdAt: new Date().toISOString()
            };
          } else {
            return null;
          }
        } catch (e) {
          return null;
        }
      }).filter(link => link !== null);
    }, styles);

    newLinks.forEach(link => illustrationData.add(JSON.stringify(link)));

    const illustrationCount = illustrationData.size;
    spinner.text = `Analyzing the site for illustrations... Current illustration count: ${illustrationCount}`;

    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) {
      break; // Arrêter si la page n'a pas grandi
    }

    // Mise à jour de la barre de progression
    const progress = Math.min((Date.now() - startTime) / (maxTimeMinutes ? maxTimeMinutes * 60 * 1000 : Infinity) * 100, 100);
    progressBar.update(progress);

    // Stop scrolling if maximum time is reached
    if (maxTimeMinutes && Date.now() - startTime > maxTimeMinutes * 60 * 1000) {
      console.log('\nMaximum scroll time reached. Stopping scroll.');
      break;
    }
  }

  // Forcer la barre de progression à 100%
  progressBar.update(100);
  progressBar.stop();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2); // in seconds

  // Sauvegarder les données JSON dans un fichier
  fs.writeFileSync('scripts/illustrations.json', JSON.stringify([...illustrationData], null, 2));

  // Mise à jour du message de fin avec illustrationData
  spinner.succeed(`\n\nIllustrations Found: ${illustrationData.size}`);
  console.log(`
    ============================
    Illustrations Found: ${illustrationData.size}
    Time Taken: ${duration} seconds
    ============================
`);

  // Fermeture du navigateur selon le choix de l'utilisateur
  if (closeBrowser) {
    await browser.close();
  } else {
    console.log('Browser left open for manual verification.');
  }
})();
