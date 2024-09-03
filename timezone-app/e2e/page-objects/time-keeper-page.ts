import { expect, type Locator, type Page } from "@playwright/test";

export class TimeKeeperPage {
  readonly page:              Page;
  readonly addTimeZoneButton: Locator;
  readonly labelInputField:   Locator;
  readonly saveButton:        Locator;
  readonly timezoneDropdown:  Locator;

  constructor(page: Page) {
    this.page = page;
    this.addTimeZoneButton = page.getByRole("button", { name: "Add timezone" });
    this.labelInputField = page.getByTestId("label-input-field");
    this.timezoneDropdown = page.getByTestId("timezone-dropdown");
    //data-testid's are not created for all as they were deemed unnecessary for the current level of complexity
    this.saveButton = page.getByRole("button", { name: "Save" });
  }

  // Go to the homepage and then wait for "Local (You)" and its time, which has been set in the config., to appear
  // Further assertions could be added e.g. only one record exists
  async goto() {
    await this.page.goto("http://localhost:3000");

    await expect(
      this.page.getByTestId("full-label")
    ).toHaveText("Local(You)");

    const time: string = this.getTimeInTimezone("America/Vancouver"); // same as in playwright.config.ts
    await expect(
      this.getRowWhereCellContainsText(time)
    ).toBeVisible();
  }

  getRowWhereCellContainsText(textQuery: string, exact: boolean = true): Locator {
    return this.page
      .getByRole("row")
      .filter({ has: this.page.getByRole("cell", { name: textQuery }) });
  }

  getTimeInTimezone(timeZone: string): string {
    return new Date().toLocaleTimeString("en-US", {
      timeZone,
      timeStyle: "short",
    });
  }

  async createTimezoneRecord(labelFieldInputValue: string, timezoneDropdownSelection: string) {
    // click 'Add Timezone'
    await this.addTimeZoneButton.click();
    // fill 'Label' 'field
    await this.labelInputField.fill(labelFieldInputValue);
    // select a drop-down option
    await this.timezoneDropdown.selectOption({
      label: timezoneDropdownSelection,
    });
    // Save
    await this.saveButton.click();
  }
} //end of class
