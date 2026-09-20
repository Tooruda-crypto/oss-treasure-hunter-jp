// Optional QA only. Install Playwright separately; it is not a runtime dependency.
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
const {chromium}=await import(process.env.OTH_PLAYWRIGHT_MODULE??'playwright');
const base=process.env.OTH_PREVIEW_URL??'http://127.0.0.1:4173/site/';
const browser=await chromium.launch({headless:true,...(process.env.OTH_CHROMIUM_PATH?{executablePath:process.env.OTH_CHROMIUM_PATH}:{})});
const results=[];const check=(name)=>results.push({name,status:'PASS'});
await mkdir('work/browser',{recursive:true});
try {
  const page=await browser.newPage({acceptDownloads:true});const errors=[];const external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
  let captured;
  for(const width of [320,375,390,768]) {
    await page.setViewportSize({width,height:900});await page.goto(base);await page.locator('.card').first().waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:`work/browser/home-${width}.png`});
    const href=await page.locator('.detail-link').first().getAttribute('href');
    await page.goto(href);await page.getByRole('heading',{name:'評価内訳',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'評価内訳',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:`work/browser/detail-${width}.png`});check(`viewport_${width}_home_detail_direct_reload`);
  }
  await page.goto(base);await page.locator('.card').first().waitFor();
  await page.locator('[name=query]').fill('sample-000');assert.equal(await page.locator('.card').count(),1);
  await page.locator('[name=query]').fill('no-match-unique');assert.equal(await page.locator('.card').count(),0);
  await page.locator('[name=query]').fill('');await page.locator('[name=license]').selectOption('Apache-2.0');assert.equal(await page.locator('.card').count(),1);check('browser_filters');
  for(const label of ['JSONを保存','Markdownを保存']){const promise=page.waitForEvent('download');await page.getByRole('link',{name:label,exact:true}).click();const dl=await promise;assert.equal(await dl.failure(),null);await dl.saveAs(`work/browser/${dl.suggestedFilename()}`);}check('json_markdown_download');
  captured=await page.evaluate(async()=>await(await fetch('./data/latest.json')).json());
  for(const status of ['PARTIAL','FAILED']) {
    await page.route('**/data/status.json',r=>r.fulfill({json:{status,attemptedAt:'2026-09-21T00:00:00Z'}}));
    await page.reload();await page.getByText('前回成功データを表示しています。',{exact:false}).waitFor();check(`status_${status}_preserves_previous`);await page.unroute('**/data/status.json');
  }
  await page.route('**/data/latest.json',r=>r.fulfill({json:null}));await page.reload();await page.getByText('公開済みの成功データはまだありません。',{exact:false}).waitFor();check('no_data');await page.unroute('**/data/latest.json');
  const stale=structuredClone(captured);stale.lastSuccessAt='2020-01-01T00:00:00Z';await page.route('**/data/latest.json',r=>r.fulfill({json:stale}));await page.reload();await page.getByText('未更新（48時間超）',{exact:false}).waitFor();check('stale');await page.unroute('**/data/latest.json');
  const injected=structuredClone(captured);const first=injected.candidates[0];first.mvp.targetUser='<img src="https://evil.invalid/a" onerror="window.PWNED=1">';first.evidence[0].url='javascript:window.PWNED=1';
  await page.route('**/data/latest.json',r=>r.fulfill({json:injected}));await page.goto(base+'#repo='+encodeURIComponent(first.repository));await page.getByRole('heading',{name:'評価内訳',exact:true}).waitFor();
  assert.equal(await page.locator('img,iframe,script:not([src="./app.js"])').count(),0);assert.equal(await page.locator('a[href^="javascript:"]').count(),0);assert.equal(await page.evaluate(()=>window.PWNED),undefined);check('browser_xss_and_unsafe_urls');await page.unroute('**/data/latest.json');
  await page.route('**/data/latest.json',r=>r.fulfill({status:500,body:'failure'}));await page.goto(base);await page.getByRole('heading',{name:'配信データを読み込めませんでした'}).waitFor();check('fetch_error_not_empty');
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);check('no_external_assets_or_console_errors');
  await writeFile('work/browser/results.json',JSON.stringify({browser:await browser.version(),basePath:new URL(base).pathname,results},null,2));
  console.log(JSON.stringify({browser:await browser.version(),checks:results.length,status:'PASS'}));
} finally {await browser.close();}
