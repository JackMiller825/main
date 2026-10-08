import { expect, test } from '@playwright/test';

test('public gate matches the inspected copy', async ({ page }) => {
  await page.setViewportSize({ width: 1363, height: 936 });
  await page.goto('/');
  await expect(page).toHaveTitle('ETH LaunchPad');
  await expect(page.getByTestId('gate-message')).toHaveText('Connect your wallet to access the dashboard.');
  await expect(page.getByTestId('connect-wallet')).toBeVisible();
  await expect(page.getByTestId('tab-launch')).toHaveCount(0);
});

test('trading fixture keeps the wide middle column and empty states', async ({ page }) => {
  await page.goto('/?fixture=trading&capture=1');
  await expect(page.getByLabel('Token name')).toHaveValue('My Token');
  await expect(page.getByLabel('Token symbol')).toHaveValue('MTK');
  await expect(page.getByText('No accounts added yet')).toBeVisible();
  await expect(page.getByText('Waiting for trades...')).toBeVisible();
  await expect(page.getByTestId('market-chip')).toContainText('26,141,713');
  const middle = await page.getByTestId('middle-panel').boundingBox();
  const watch = await page.getByTestId('watch-panel').boundingBox();
  expect(middle && watch && middle.width > watch.width + 40).toBeTruthy();
});

test('config scrolls independently to advanced mode', async ({ page }) => {
  await page.goto('/?fixture=config&scroll=advanced&capture=1');
  await expect(page.getByLabel('Pool size minimum')).toHaveValue('2');
  await expect(page.getByLabel('Pool size maximum')).toHaveValue('8');
  await expect(page.getByText('Advanced Mode')).toBeVisible();
  const scrollTop = await page.getByTestId('config-body').evaluate((element) => element.scrollTop);
  expect(scrollTop).toBeGreaterThan(40);
});

test('wallet fixture shows the engine registry and blocks key download', async ({ page }) => {
  await page.goto('/?fixture=wallet&capture=1');
  await expect(page.getByText('Engine Wallets Summary')).toBeVisible();
  await expect(page.getByText('Active 200')).toBeVisible();
  await page.getByTestId('download-pks').click();
  await expect(page.getByText(/no file was created/i)).toBeVisible();
});

test('editor fixture is uncompiled and engine run sends nothing', async ({ page }) => {
  await page.goto('/?fixture=editor&capture=1');
  await expect(page.getByRole('heading', { name: 'Contract Editor' })).toBeVisible();
  await expect(page.getByTestId('editor-source')).toContainText('library SafeMath');
  await expect(page.getByTestId('deploy-button')).toHaveCount(0);
  const middle = await page.getByTestId('middle-panel').boundingBox();
  const watch = await page.getByTestId('watch-panel').boundingBox();
  expect(middle && watch && Math.abs(middle.width - watch.width) < 24).toBeTruthy();
  await page.getByTestId('tab-config').click();
  await page.getByTestId('engine-run').click();
  await expect(page.getByText(/No jobs were queued/i)).toBeVisible();
  await expect(page.getByText('Waiting for trades...')).toBeVisible();
});

test('narrow widths stack the panels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/?fixture=trading&capture=1');
  const left = await page.getByTestId('left-panel').boundingBox();
  expect(left && left.width).toBeGreaterThan(340);
});
