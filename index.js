const { chromium } = require("playwright");
const path = require("path");
const fsPromises = require("fs/promises");
const settings = require("./setting.js");

if (require.main === module) {
  main();
}

async function main() {
  try {
    const browser = await chromium.launch({ headless: false, devtools: true });
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
        const dirname = path.join(__dirname, "img");

        if (settings.auth.user || settings.auth.pass) {
          await page.setExtraHTTPHeaders({
            Authorization: `Basic ${new Buffer.from(
              `${settings.auth.user}:${settings.auth.pass}`
            ).toString("base64")}`,
          });
        }

        await page.goto(url, { waitUntil: "load", timeout: 30000 });

        for (setviewport in settings.width) {
          await page.setViewportSize({
            width: settings.width[setviewport],
            height: 768,
            deviceScaleFactor: 2,
          });
          const bodyElement = await page.$("body");
          const pageHeight = await bodyElement.evaluate(
            (node) => node.getBoundingClientRect().height
          );

          for (
            let scrollHeight = 0;
            scrollHeight < pageHeight;
            scrollHeight += 768
          ) {
            await page.waitForTimeout(500);
            await page.evaluate(() => {
              window.scrollBy(0, 768);
            });
          }
          await page.evaluate(() => {
            window.scroll(0, 0), 200;
          });
          const destination = path.join(
            dirname,
            filename + "_" + settings.width[setviewport] + ".png"
          );

          await fsPromises.mkdir(path.dirname(destination), {
            recursive: true,
          });
          await page.screenshot({ path: destination, fullPage: true });
          console.log("Finished!!");
        }
      }
    } finally {
       await browser.close();
    }
  } catch (err) {
    console.error(err);
  }
}
