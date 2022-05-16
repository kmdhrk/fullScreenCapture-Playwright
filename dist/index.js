"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const path_1 = __importDefault(require("path"));
const setting_1 = require("./setting");
const fs_1 = require("fs");
if (require.main === module) {
    main();
}
async function main() {
    try {
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            const urls = setting_1.subDir.map((dirName) => {
                return [
                    setting_1.domain + (dirName && "/" + dirName),
                    dirName || "index",
                ];
            });
            for (const [url, filename] of urls) {
                if (setting_1.authInfo.user || setting_1.authInfo.pass) {
                    await page.setExtraHTTPHeaders({
                        Authorization: `Basic ${Buffer.from(`${setting_1.authInfo.user}:${setting_1.authInfo.pass}`).toString("base64")}`,
                    });
                }
                await page.goto(url, { waitUntil: "load", timeout: 30000 });
                for (const setViewWidth of setting_1.viewportWidth) {
                    // ビューポートセット
                    const setViewHeight = 720;
                    await page.setViewportSize({
                        width: setViewWidth,
                        height: setViewHeight,
                    });
                    const isMinViewWidth = Math.min(...setting_1.viewportWidth) === setViewWidth;
                    if (isMinViewWidth) {
                        // ページの高さを取得
                        const bodyElement = await page.locator('body');
                        const pageHeight = await bodyElement.evaluate((node) => node.getBoundingClientRect().height);
                        // 下までスクロール
                        for (let scrollHeight = 0; scrollHeight < pageHeight; scrollHeight += setViewHeight) {
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
                    const dirname = path_1.default.join(__dirname, "img");
                    const destination = path_1.default.join(dirname, filename + "_" + setViewWidth + ".png");
                    await fs_1.promises.mkdir(path_1.default.dirname(destination), {
                        recursive: true,
                    });
                    // スクリーンショット
                    await page.screenshot({ path: destination, fullPage: true });
                    console.log(`Captured ${filename}_${setViewWidth}`);
                }
            }
        }
        finally {
            await browser.close();
        }
    }
    catch (err) {
        console.error(err);
    }
}
//# sourceMappingURL=index.js.map