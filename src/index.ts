import puppeteer, { Page } from 'puppeteer-core';
import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({
	description: "Pull the name, title, and company of an ON24 event"
});

parser.add_argument('-u', '--EVENT_URL', { help: "The full url to the ON24 event" });
parser.add_argument('-m', '--EVENT_URLS', { help: "A list of urls that are seperated by the delimeter *&&*" });
const delimiter = "*&&*";
const { EVENT_URL, EVENT_URLS } = parser.parse_args();

async function getOn24Info(url: string, page: Page) {

	await page.goto(url, {
		waitUntil: "networkidle0",
	});

	const speakerGroupSelector = '.sp-begin';
	const speakerNameSelector = '.sp-name';
	const speakerTitleSelector = '.sp-title';
	const speakerCompanySelector = '.sp-company';

	const speakerGroupSelector2 = '.speakerInfoContainer';
	const speakerNameSelector2 = '.speakerName';
	const speakerTitleSelector2 = '.speakerRole';

	const getArray1 = await page.$$eval(speakerGroupSelector,
		(speakerGroup, nameSelector, titleSelector, companySelector) => {
			let contents;

			contents = speakerGroup.map(speaker => {
				const name = speaker.querySelector(nameSelector)?.innerHTML;
				const title = speaker.querySelector(titleSelector)?.innerHTML;
				const company = speaker.querySelector(companySelector)?.innerHTML;
				return [name, title, company]
			});
			return contents;

		}
		, speakerNameSelector, speakerTitleSelector, speakerCompanySelector);

	const getArray2 = await page.$$eval(speakerGroupSelector2,
		(speakerGroup, nameSelector, titleSelector) => {
			let contents;

			contents = speakerGroup.map(speaker => {
				const name = speaker.querySelector(nameSelector)?.innerHTML;
				const title = speaker.querySelector(titleSelector)?.innerHTML;

				return [name, title, ""];
			});
			return contents;

		}
		, speakerNameSelector2, speakerTitleSelector2);

	const finalArray = getArray1.length ? getArray1 : getArray2;

	const joinedString = finalArray.map(arr => arr.join(delimiter)).join(delimiter);

	// THIS IS WHAT WE ARE COPYING TO GOOGLE SHEETS
	console.log(url + delimiter + joinedString);
}

(async () => {

	// await page.goto('https://www.brandlive.com/company');
	const browser = await puppeteer.launch({ executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome', headless: false });
	const page = await browser.newPage();
	if (EVENT_URL) {
		await getOn24Info(EVENT_URL, page);
	}
	else if (EVENT_URLS) {
		const urls = EVENT_URLS.split(delimiter);
		for (const url of urls) {
			await getOn24Info(url, page);
		}
	}

	await browser.close();
})();