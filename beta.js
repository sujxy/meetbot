import puppeteer from "puppeteer";

const joinMeeting = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-fake-ui-for-media-stream",
    ],
  });
  const page = await browser.newPage();

  try {
    // Navigate to Zoom join page
    await page.goto("https://app.zoom.us/wc/join");

    // Enter meeting ID and click join
    await page.waitForSelector(".join-meetingId", { visible: true });
    await page.type(".join-meetingId", "793 2753 2898");

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click(".btn-join.btn-primary"),
    ]);

    // // Wait for password/name modal and fill details
    // await page.waitForSelector("#input-for-pwd", {
    //   visible: true,
    //   timeout: 10000,
    // });

    // // Fill password
    // await page.type("#input-for-pwd", "F8d8Z5");

    // // Fill name (corrected selector)
    // await page.waitForSelector("#input-for-name", {
    //   visible: true,
    //   timeout: 10000,
    // });
    // await page.type("#input-for-name", "Your Name"); // Replace with actual name

    // // Wait for join button to be enabled (remove disabled class)
    // await page.waitForFunction(
    //   () => {
    //     const btn = document.querySelector(".preview-join-button");
    //     return btn && !btn.classList.contains("disabled");
    //   },
    //   { timeout: 10000 }
    // );

    // // Click final join button
    // await page.click(".preview-join-button:not(.disabled)");

    // // Keep browser open for 30 seconds
    // await page.waitForTimeout(30000);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    //await browser.close();
  }
};

joinMeeting().catch(console.error);

// 793 3679 4050
// j9WqbF
