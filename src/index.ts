import { chromium } from "playwright";
import path from "path";
import sitesData from "./setting.json";
import { promises as fs } from "fs";


if (require.main === module) {
  main();
}

async function main() {
  try {
    const browser = await chromium.launch({ headless: false, args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins', '--disable-site-isolation-trials', '--disable-features=BlockInsecurePrivateNetworkRequests',], devtools: true });
    const context = await browser.newContext();

    const page = await context.newPage();
    try {
      // サイトごとにループ
      for (const site of sitesData) {
        const urls = site.subDir.map((dirName: string) => {
          return [
            site.domain + (dirName && "/" + dirName),
            dirName || "index",
          ];
        });

        // ページごとにループ
        for (const [url, filename] of urls) {

          // Basic認証対策
          if (site.authInfo?.user || site.authInfo?.pass) {
            await page.setExtraHTTPHeaders({
              Authorization: `Basic ${Buffer.from(
                `${site.authInfo.user}:${site.authInfo.pass}`
              ).toString("base64")}`,
            });
          }
          // ページへアクセス
          await page.goto(url, { waitUntil: "load", timeout: 30000 });

          // 画面幅ごとにループ
          for (const setViewWidth of site.viewportWidth) {
            const setViewHeight: number = 720;
            await page.setViewportSize({
              width: setViewWidth,
              height: setViewHeight,
            });

            // 画面最小幅のとき一度下までスクロール
            const isMinViewWidth = Math.min(...site.viewportWidth) === setViewWidth;
            if (isMinViewWidth) {
              // ページの高さを取得
              const bodyElement = await page.locator('body');
              const pageHeight = await bodyElement.evaluate(
                (node: HTMLElement) => node.getBoundingClientRect().height
              );

              // 下までスクロール
              for (
                let scrollHeight = 0;
                scrollHeight < pageHeight;
                scrollHeight += setViewHeight
              ) {
                await page.waitForTimeout(500);
                await page.evaluate(() => {
                  window.scrollBy(0, 720);
                });
              }
              await page.evaluate(() => {
                window.scroll(0, 0), 200;
              });
            }

            // 保存設定
            const dirname = path.join(__dirname.replace('dist', 'img') + "/" + site.domain.replace(/(https|http):\/\//g, "").replace(/\//g, "_"));
            const imgName = filename.replace(/\//g, "_") + "_" + setViewWidth + ".png"
            const destination = path.join(
              dirname, imgName
            );
            await fs.mkdir(path.dirname(destination), {
              recursive: true,
            });

            // スクリーンショット
            await page.screenshot({ path: destination, fullPage: true });
            console.log(`Captured ${filename}_${setViewWidth}`);
          }
        }
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error(err);
  }
}
