import { expect, Locator, test } from "@playwright/test";
import { TimeKeeperPage } from "../page-objects/time-keeper-page";

test.describe("Addition of new timezones", () => {
  let timeKeeperPage: TimeKeeperPage;

  test.beforeEach(({ page }) => {
    timeKeeperPage = new TimeKeeperPage(page);
  });

  test('checks values in columns of "Label", "Timezone" and "Local Time"', async () => {
    const sampleLabelInput: string = "Anchorage";
    const sampleDropdownSelection: string = "Alaska Standard Time";
    const timezoneFieldValue: string = "America/Juneau";

    await timeKeeperPage.goto();
    await timeKeeperPage.createTimezoneRecord(
      sampleLabelInput,
      sampleDropdownSelection
    );

    await expect(
      timeKeeperPage.getRowWhereCellContainsText(sampleLabelInput)
    ).toBeVisible();
    await expect(
      timeKeeperPage.getRowWhereCellContainsText(timezoneFieldValue)
    ).toBeVisible();

    const timeInAmericaJuneau: string =
      timeKeeperPage.getTimeInTimezone(timezoneFieldValue);

    await expect(
      timeKeeperPage.getRowWhereCellContainsText(timeInAmericaJuneau)
    ).toBeVisible();
  });
}); //end of test.describe('Addition of new timezones')

test.describe("Sorting of timezones", () => {
  let timeKeeperPage: TimeKeeperPage;

  test.beforeEach(({ page }) => {
    timeKeeperPage = new TimeKeeperPage(page);
  });

  // This test fails due to https://github.com/Noffica/Playwright-tests-on-a-SPA/issues/8
  // Additionally, until this is addressed, the test will *not* be edited further to use page objects properly…
  // … nor use more a more efficient locator strategy than use of `nth()`…
  // https://github.com/Noffica/Playwright-tests-on-a-SPA/issues/3 also requires clarification
  test("sorts successfully according to time", async () => {
    await timeKeeperPage.goto();

    await timeKeeperPage.createTimezoneRecord(
      "M-Mountain",
      "Mountain Standard Time"
    );
    await timeKeeperPage.createTimezoneRecord(
      "K-Central",
      "Central Standard Time"
    );

    await expect(
      timeKeeperPage.page.getByRole("row").nth(1)
    ).toContainText("Local(You)");

    await expect(
      timeKeeperPage.page.getByRole("row").nth(2)
    ).toContainText("M-Mountain");

    await expect(
      timeKeeperPage.page.getByRole("row").nth(3)
    ).toContainText("K-Central");
  });
}); //end of test.describe('Sorting of timezones')

test.describe("Deletion of timezone records", () => {
  let timeKeeperPage: TimeKeeperPage;

  test.beforeEach(({ page }) => {
    timeKeeperPage = new TimeKeeperPage(page);
  });

  test("successfully deletes single newly created timezone record", async () => {
    const sampleLabelInput: string = "K-Central";
    const sampleDropdownSelection: string = "Central Standard Time";

    await timeKeeperPage.goto();

    const numberOfRowsAtStart: number = await timeKeeperPage.page
      .getByRole("row")
      .count();

    await timeKeeperPage.createTimezoneRecord(
      sampleLabelInput,
      sampleDropdownSelection
    );
    // See earlier code for assertions of creation

    const numberOfRowsAfterCreation: number = await timeKeeperPage.page
      .getByRole("row")
      .count();
    expect(numberOfRowsAfterCreation).toBe(numberOfRowsAtStart + 1);

    const createdRow: Locator =
      timeKeeperPage.getRowWhereCellContainsText(sampleLabelInput);

    await createdRow.getByRole("button", { name: "Delete" }).click();

    // assert deletion by checking row count and absence of created label. Time and timezone are deemed unnecessary.
    const numberOfRowsAfterDeletion: number = await timeKeeperPage.page
      .getByRole("row")
      .count();
    expect(numberOfRowsAfterDeletion).toBe(numberOfRowsAtStart);
    await expect(
      timeKeeperPage.getRowWhereCellContainsText(sampleLabelInput)
    ).not.toBeVisible();

    // assert previously existent record(s) still exist(s)
    await expect(
      timeKeeperPage.getRowWhereCellContainsText("Local(You)")
    ).toBeVisible();
  });

  test.skip('successfully deletes multiple non-"You" records', async () => {
    // similar to previous
  });

  // This test fails due to https://github.com/Noffica/Playwright-tests-on-a-SPA/issues/2
  // The main assertion needs to be updated depending on the solution
  // e.g. `.not.toBeVisible()` instead of `.toBeDisabled()`
  test('confirms inability to delete "Local (You)" record', async () => {
    await timeKeeperPage.goto(); //recall that this contains assertions for starting/seeded record

    const youRowDeleteButton: Locator = timeKeeperPage
      .getRowWhereCellContainsText("Local(You)")
      .getByRole("button", { name: "Delete" });

    await expect(youRowDeleteButton).toBeDisabled();
  });
}); //end test.describe('Deletion of timezone records')
