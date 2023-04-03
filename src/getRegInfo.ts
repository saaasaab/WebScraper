import puppeteer, { Page } from 'puppeteer-core';
import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({
	description: "Pull the name, title, and company of an ON24 event"
});

parser.add_argument('-u', '--EVENT_URL', { help: "The full url to the ON24 event" });
parser.add_argument('-m', '--EVENT_URLS', { help: "A list of urls that are seperated by the delimeter *&&*" });
const delimiter = "*&&*";
const { EVENT_URL, EVENT_URLS } = parser.parse_args();


function getFilledArray(arrays: String[][][]) {
	const filledArrays = arrays.filter(array => array.length > 0);
	if (filledArrays.length >= 1) {
		return filledArrays[0];
	} else {
		return
		// throw new Error('More than one array is filled!');
	}
}


async function getSelectorContent(page: Page, cssSelector: string) {
	return page.$$eval(cssSelector, (elements) =>
		elements.map((element) => element.outerHTML)
	);
}



async function getOn24Info(url: string, page: Page) {

	await page.goto(url, {
		waitUntil: "networkidle0",
	});

	const regFormSelector = '.reg-form';
	const regFieldSelectors = ['select.form-control', 'textarea.form-control', 'input.form-control', 'input.data-checkbox'];

	const inputs = await page.$$eval(regFieldSelectors[0],
		(inputs, url) => {
			const tempLabel: any[] = [];
			inputs.map((el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
				return tempLabel.push([url, el?.name, el?.ariaLabel])
			});
			return tempLabel;
		}, url);

	const selects = await page.$$eval(regFieldSelectors[1],
		(inputs, url) => {
			const tempLabel: any[] = [];
			inputs.map((el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
				return tempLabel.push([url, el?.name, el?.ariaLabel])
			});
			return tempLabel;
		}, url);

	const textarea = await page.$$eval(regFieldSelectors[2],
		(inputs, url) => {
			const tempLabel: any[] = [];
			inputs.map((el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
				return tempLabel.push([url, el?.name, el?.ariaLabel])
			});
			return tempLabel;
		}, url);

	const checkboxes = await page.$$eval(regFieldSelectors[3],
		(inputs, url) => {
			const tempLabel: any[] = [];
			inputs.map((el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
				return tempLabel.push([url, el?.name, el?.ariaLabel])
			});
			return tempLabel;
		}, url);



	const labels = [...inputs, ...selects, ...textarea, ...checkboxes];


	console.log(labels.map(group =>
		group.join("*&&*")
	).join("\n"));

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