import { chromium } from "playwright";
import path from "path";
import { domain, subDir, viewportWidth, authInfo } from "./setting";
import { promises as fs } from "fs";


if (require.main === module) {
  main();
}

async function main() {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      const urls = subDir.map((dirName: string) => {
        return [
          domain + (dirName && "/" + dirName),
          dirName || "index",
        ];
      });

      for (const [url, filename] of urls) {
        if (authInfo.user || authInfo.pass) {
          await page.setExtraHTTPHeaders({
            Authorization: `Basic ${Buffer.from(
              `${authInfo.user}:${authInfo.pass}`
            ).toString("base64")}`,
          });
        }

        await page.goto(url, { waitUntil: "load", timeout: 30000 });

        for (const setViewWidth of viewportWidth) {
          // ビューポートセット
          const setViewHeight: number = 720;
          await page.setViewportSize({
            width: setViewWidth,
            height: setViewHeight,
          });

          const isMinViewWidth = Math.min(...viewportWidth) === setViewWidth;
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
                window.scrollBy(0, 768);
              });
            }
            await page.evaluate(() => {
              window.scroll(0, 0), 200;
            });
          }

          // 保存設定
          const dirname = path.join(__dirname, "img");
          const destination = path.join(
            dirname,
            filename + "_" + setViewWidth + ".png"
          );

          await fs.mkdir(path.dirname(destination), {
            recursive: true,
          });

          // スクリーンショット
          await page.screenshot({ path: destination, fullPage: true });
          console.log(`Captured ${filename}_${setViewWidth}`);
        }
      }
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error(err);
  }
}
