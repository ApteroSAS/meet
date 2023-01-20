// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createWorld, Entity, LazyEntity, registerLocalModule} from "@aptero/axolotis-player";

//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import {
    startErrorWatch, stopErrorWatch,
} from "../playwright-lib/TestCommon";

test('index.html', async ({ page }) => {
    await page.goto('index.html');
});

test('microsoft settings html', async ({ page }) => {
    await page.goto('microsoft-settings.html?msteams=true');
});

