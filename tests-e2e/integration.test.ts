import { test, expect } from "@playwright/test";

test.describe("Game board", () => {
  test("Render initial state of a page", async ({ page }) => {
    await page.goto("http://localhost:5173");

    await expect(page).toHaveTitle(/Wordl/);
    await expect(page.getByRole("heading", { name: "Wordle" })).toBeInViewport();

    await expect(page.getByRole("main")).toBeInViewport();
    await expect(page.getByRole("navigation")).toBeInViewport();
  });
  test("User presses 'A' key", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("main").press("A");

    const cell = page.locator("main div:first-child span:first-child");
    await expect(cell).toHaveText("A");
  });

  test("User makes first attempt", async ({ page }) => {
    await page.route(
      "https://api.frontendexpert.io/api/fe/wordle-words",
      async (route) => {
        const json = ["CLOUD"];
        await route.fulfill({ json });
      }
    );

    await page.goto("/");

    const board = page.getByRole("main");
    "HELLO".split("").forEach(async (ch) => {
      await board.press(ch);
    });
    await board.press("Enter");

    const firt_row = page.locator("main div:first-child");
    expect(firt_row).toHaveText("HELLO");

    "CLOUD".split("").forEach(async (ch) => {
      await board.press(ch);
    });
    await board.press("Enter");

    const second_row = page.locator("main div:nth-child(2)");
    expect(second_row).toHaveText("CLOUD");

    "WORLD".split("").forEach(async (ch) => {
      await board.press(ch);
    });
    await board.press("Enter");
    await board.press("Enter");

    const third_row = page.locator("main div:nth-child(3)");
    expect(third_row).toHaveText("WORLD");
  });
});
