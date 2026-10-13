const { _electron: electron } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'desktop-artifacts');
const profile = path.join(artifacts, 'development-profile');
const sample = 'Invoice 00123 | عربي ٠٠٤٥٦ | فارسی ۰۰۷۸۹\n0123456789 / ٠١٢٣٤٥٦٧٨٩ / ۰۱۲۳۴۵۶۷۸۹; -12.50%, [ref](#001) <tag> & "quotes"';
const expected = {
  western: 'Invoice 00123 | عربي 00456 | فارسی 00789\n0123456789 / 0123456789 / 0123456789; -12.50%, [ref](#001) <tag> & "quotes"',
  arabicIndic: 'Invoice ٠٠١٢٣ | عربي ٠٠٤٥٦ | فارسی ٠٠٧٨٩\n٠١٢٣٤٥٦٧٨٩ / ٠١٢٣٤٥٦٧٨٩ / ٠١٢٣٤٥٦٧٨٩; -١٢.٥٠%, [ref](#٠٠١) <tag> & "quotes"',
  easternArabicIndic: 'Invoice ۰۰۱۲۳ | عربي ۰۰۴۵۶ | فارسی ۰۰۷۸۹\n۰۱۲۳۴۵۶۷۸۹ / ۰۱۲۳۴۵۶۷۸۹ / ۰۱۲۳۴۵۶۷۸۹; -۱۲.۵۰%, [ref](#۰۰۱) <tag> & "quotes"',
};
const report = { test: 'Actual Joplin desktop, isolated development profile', passed: false, checks: [], platform: process.platform };
let app;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function eventually(fn, label, timeout = 60000) {
  const end = Date.now() + timeout;
  let last;
  do {
    try { const value = await fn(); if (value) return value; } catch (error) { last = error; }
    await pause(500);
  } while (Date.now() < end);
  throw new Error(`Timed out: ${label}${last ? ': ' + last.message : ''}`);
}

async function menu(action) {
  return app.evaluate(({ Menu, BrowserWindow }, action) => {
    const items = [];
    function walk(menu) {
      for (const item of menu?.items || []) {
        items.push(item);
        if (item.submenu) walk(item.submenu);
      }
    }
    walk(Menu.getApplicationMenu());
    if (action === 'inventory') return items.map(i => ({ label: i.label, enabled: i.enabled, accelerator: i.accelerator }));
    const item = items.find(i => /Idraaak Digit Switcher/.test(i.label));
    if (!item || !item.enabled) return false;
    if (action === 'open') item.click(undefined, BrowserWindow.getAllWindows().find(w => w.isVisible()));
    return true;
  }, action);
}

async function pluginFrame(page) {
  return eventually(async () => {
    for (const frame of page.frames()) {
      if (await frame.locator('#digit-switcher').isVisible()) return frame;
    }
    return false;
  }, 'visible plugin dialog');
}

async function diagnostics() {
  if (!app) return;
  await fs.writeFile(path.join(artifacts, 'menus.json'), JSON.stringify(await menu('inventory'), null, 2)).catch(() => {});
  for (const [i, page] of app.windows().entries()) {
    await page.screenshot({ path: path.join(artifacts, `window-${i}.png`) }).catch(() => {});
    for (const [j, frame] of page.frames().entries()) {
      await fs.writeFile(path.join(artifacts, `window-${i}-frame-${j}.html`), await frame.content()).catch(() => {});
    }
  }
}

(async () => {
  await fs.mkdir(path.join(profile, 'plugins'), { recursive: true });
  await fs.copyFile(path.join(root, 'publish/com.idraaak.digitSwitcher.jpl'), path.join(profile, 'plugins/com.idraaak.digitSwitcher.jpl'));
  app = await electron.launch({
    executablePath: process.env.JOPLIN_EXECUTABLE,
    args: ['--env', 'dev', '--profile', profile, '--log-level', 'debug'],
    chromiumSandbox: true,
    timeout: 120000,
  });
  const stream = await fs.open(path.join(artifacts, 'process.log'), 'w');
  app.process().stdout?.on('data', data => stream.write(data));
  app.process().stderr?.on('data', data => stream.write(data));
  report.joplinVersion = await app.evaluate(({ app }) => app.getVersion());
  assert.equal(report.joplinVersion, '3.7.21');
  const page = await app.firstWindow();
  page.setDefaultTimeout(20000);
  await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows().find(w => w.isVisible());
    window?.setSize(1400, 1000);
  });
  await eventually(() => page.locator('.cm-content[contenteditable="true"]').isVisible(), 'Markdown editor ready', 90000);
  await page.keyboard.press('Control+n');
  const editor = page.locator('.cm-content[contenteditable="true"]');
  await editor.waitFor({ state: 'visible' });
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.insertText(sample);
  await eventually(async () => (await editor.innerText()).includes('Invoice 00123'), 'sample note entered');
  const originalEditor = await editor.innerText();
  await eventually(() => menu('ready'), 'plugin Tools command enabled');
  report.checks.push('Built .jpl loaded by Joplin; Tools menu command enabled for Markdown note');
  await app.context().setOffline(true);
  report.checks.push('Renderer network offline during preview and copy tests');
  for (const style of Object.keys(expected)) {
    await editor.click();
    await page.keyboard.press('Control+a');
    assert.equal(await menu('open'), true);
    const frame = await pluginFrame(page);
    assert.equal(await frame.locator('#original').inputValue(), sample);
    await frame.locator('#target').selectOption(style);
    await eventually(async () => (await frame.locator('#preview').inputValue()) === expected[style], `${style} exact preview`);
    await page.screenshot({ path: path.join(artifacts, `joplin-${style}.png`) });
    await page.getByRole('button', { name: 'Copy to clipboard', exact: true }).click();
    await eventually(async () => (await app.evaluate(({ clipboard }) => clipboard.readText())) === expected[style], `${style} actual clipboard`);
    assert.equal(await editor.innerText(), originalEditor);
    report.checks.push(`${style}: exact preview and system clipboard; leading zeros, multiline mixed text, punctuation and note preserved`);
  }
  await editor.click();
  await page.keyboard.press('Control+a');
  await menu('open');
  await pluginFrame(page);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  assert.equal(await app.evaluate(({ clipboard }) => clipboard.readText()), expected.easternArabicIndic);
  assert.equal(await editor.innerText(), originalEditor);
  report.checks.push('Close leaves note and clipboard unchanged');
  report.passed = true;
  console.log(JSON.stringify(report, null, 2));
})().catch(async error => {
  report.error = error.stack;
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await diagnostics();
  await fs.mkdir(artifacts, { recursive: true });
  await fs.writeFile(path.join(artifacts, 'report.json'), JSON.stringify(report, null, 2));
  await app?.close().catch(() => {});
});
