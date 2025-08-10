from playwright.sync_api import sync_playwright, expect
import re

def clear_database(page):
    response = page.request.post("http://localhost:5000/api/testing/clear-database")
    expect(response).to_be_ok()

def run_script():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # --- Data Generation ---
            clear_database(page)
            page.goto("http://localhost:5000/dashboard")
            page.get_by_role("button", name="Start Interview").click()
            expect(page).to_have_url(re.compile(r"/interview/"))
            expect(page.get_by_text("AI • Just now")).to_be_visible()
            page.get_by_role("button", name="Type").click()
            page.get_by_placeholder("Type your answer here...").fill("I have experience with both React and Node.js, and I'm comfortable working on the full stack.")
            page.get_by_role("button", name="Submit").click()
            expect(page.get_by_text("Feedback")).to_be_visible()
            page.get_by_role("button", name="End Interview").click()
            expect(page).to_have_url(re.compile(r"/history"))
            print("Data generation complete.")

            # --- Screenshot Capture ---
            # 1. History Page
            page.screenshot(path="docs/screenshots/history.png")
            print("Captured history.png")

            # 2. Dashboard Page
            page.goto("http://localhost:5000/dashboard")
            expect(page.get_by_text("Recent Sessions")).to_be_visible()
            page.screenshot(path="docs/screenshots/dashboard.png")
            print("Captured dashboard.png")

            # 3. Session Details Page
            page.goto("http://localhost:5000/history")
            page.get_by_role("button", name="View Details").first.click()
            expect(page).to_have_url(re.compile(r"/history/"))
            expect(page.get_by_role("heading", name="Conversation History")).to_be_visible()
            page.screenshot(path="docs/screenshots/session_details.png")
            print("Captured session_details.png")

            print("Snapshot script completed successfully.")

        except Exception as e:
            print(f"Snapshot script failed: {e}")
            page.screenshot(path="docs/screenshots/snapshot_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run_script()
