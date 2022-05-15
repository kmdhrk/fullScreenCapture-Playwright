const { chromium } = require("playwright");
const path = require("path");
const fsPromises = require("fs/promises");
const settings = require("./setting.js");

if (require.main === module) {
  main();
}

async function main() {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      const urls = settings.subDir.map((dirName) => {
        return [
          settings.domain + (dirName && "/" + dirName),
          dirName || "index",
        ];
      });

      for (const [url, filename] of urls) {
        if (settings.auth.user || settings.auth.pass) {
          await page.setExtraHTTPHeaders({
            Authorization: `Basic ${new Buffer.from(
              `${settings.auth.user}:${settings.auth.pass}`
            ).toString("base64")}`,
          });
        }

        await page.goto(url, { waitUntil: "load", timeout: 30000 });

        for (const setViewWidth of settings.width) {
          // ビューポートセット
          const setViewHeight = 720;
          await page.setViewportSize({
            width: setViewWidth,
            height: setViewHeight,
            deviceScaleFactor: 2,
          });

          const isMinViewWidth = Math.min(...settings.width) === setViewWidth;
          if (isMinViewWidth) {
            // ページの高さを取得
            const bodyElement = await page.$("body");
            const pageHeight = await bodyElement.evaluate(
              (node) => node.getBoundingClientRect().height
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

          await fsPromises.mkdir(path.dirname(destination), {
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
