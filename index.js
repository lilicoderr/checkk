const express = require("express");
const { chromium } = require("playwright");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 5000;

// Browser instance for reuse
let browser = null;

// Initialize browser with Replit-compatible options
async function initBrowser() {
  if (!browser) {
    console.log("Initializing browser...");
    try {
      let launchOptions = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
        ],
      };

      // Try system Chromium first
      try {
        launchOptions.executablePath =
          "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium";
        browser = await chromium.launch(launchOptions);
        console.log("Browser initialized successfully using system Chromium");
      } catch (systemError) {
        console.log(
          "System Chromium not available, trying Playwright Chromium...",
        );
        delete launchOptions.executablePath;
        browser = await chromium.launch(launchOptions);
        console.log(
          "Browser initialized successfully using Playwright Chromium",
        );
      }
    } catch (error) {
      console.error("Failed to initialize browser:", error.message);
      throw error;
    }
  }
  return browser;
}

// Main crawler function
async function crawlWakscord() {
  let page = null;

  try {
    const browserInstance = await initBrowser();
    page = await browserInstance.newPage();

    // Set user agent to avoid bot detection
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    // Set viewport for consistent rendering
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log("Navigating to wakscord.com...");

    // Navigate to the target URL
    await page.goto("https://everywak.kr/weather", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for the page to load completely
    console.log("Waiting for page to load...");
    await page.waitForTimeout(5000); // Wait an additional 5 seconds to ensure dynamic content has loaded

    // Get the fully rendered HTML
    const response = await page.content();

    // Use cheerio to parse the HTML
    const $ = cheerio.load(response);

    // Initialize an empty string to hold the information
    let weatherInfo = "";

    // Extract and format the data into "이름(상태, 설명)" 형태로
    $("div.TodayWeatherItem._container_bf2we_83").each((i, element) => {
      const name =
        $(element).find("div._name_bf2we_101").text().trim() || "No Name";
      const state =
        $(element).find("div._state_bf2we_182").text().trim() || "No State";
      const description =
        $(element).find("div._description_bf2we_188").text().trim() ||
        "No Description";

      // 정보를 "이름(상태, 설명)" 형태로 조합
      weatherInfo += `<div class="info">
                        <p class="name">${name}</p>
                        <p>${state}, ${description}</p>
                      </div>`;
    });

    console.log("Successfully crawled and formatted weather information");

    // Return the HTML with the weather cards
    const fullHtml = `
      <html>
        <head>
          <title>Weather Information</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }

            .container {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin-top: 20px;
              padding: 20px;
            }

            .info {
              width: 250px;
              margin: 10px;
              padding: 20px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
              font-size: 1.1em;
            }

            .info p {
              font-size: 0.9em;
              color: #666;
            }

            .info .name {
              font-weight: bold;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${weatherInfo}
          </div>
        </body>
      </html>
    `;

    return fullHtml;
  } catch (error) {
    console.error("Error during crawling:", error.message);
    throw error;
  } finally {
    // Always close the page to free resources
    if (page) {
      try {
        await page.close();
        console.log("Page closed successfully");
      } catch (closeError) {
        console.error("Error closing page:", closeError.message);
      }
    }
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Wakscord Crawler Server",
  });
});

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

// Main page - directly show crawled content
app.get("/", async (req, res) => {
  const startTime = Date.now();

  try {
    console.log(`[${new Date().toISOString()}] Received request for main page`);
    const htmlContent = await crawlWakscord(); // 크롤링된 전체 HTML 내용 받기
    const endTime = Date.now();
    console.log(
      `[${new Date().toISOString()}] Main page request processed in ${endTime - startTime}ms`,
    );

    // 크롤링된 HTML을 그대로 렌더링해서 표시
    res.send(htmlContent);
  } catch (error) {
    const endTime = Date.now();
    console.error(
      `[${new Date().toISOString()}] Error processing main page request:`,
      error.message,
    );
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
