import "./style.css";

async function main() {
	const browser = await ProxyBrowser.start();
	console.log(browser.page);
}

class ProxyBrowser {
	static BASE = "http://localhost:8888/browse";

	static async start() {
		const page = await fetchPage(ProxyBrowser.BASE);
		return new ProxyBrowser(page);
	}

	page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async visit(url: string) {
		this.page = await fetchPage(`${ProxyBrowser.BASE}${url}`);
		return this;
	}
}

async function fetchPage(url: string): Promise<Page> {
	const host = new URL(url).host;
	const doc = await fetchDocument(url);
	const title = doc.querySelector("title")?.textContent;
	if (!title) throw new Error("missing title");

	const items: Item[] = [];

	// let heading: Item | null = null;
	let text: Item | null = null;

	function iterate(container: Element) {
		if (!container.hasChildNodes()) return;

		const children = container.childNodes;

		for (const node of children) {
			// debugger;
			if (node.nodeType === Node.TEXT_NODE) {
				if (!items.length) continue;
				const textContent = (node.textContent || "").trim();
				if (!textContent) continue;
				if (!text) text = { tagName: "P", textContent };
			}
			if (node.nodeType !== Node.ELEMENT_NODE) continue;

			const element = node as Element;

			const { tagName } = element;
			if (/^H[1-6]$/.test(tagName)) {
				if (text) {
					items.push(text);
					text = null;
				}
				const textContent = element.textContent || "";
				items.push({ tagName, textContent });
				continue;
			}
			if (tagName === "A") {
				if (text) {
					items.push(text);
					text = null;
				}
				const anchor = element as HTMLAnchorElement;
				const textContent = anchor.textContent || "";
				const u = new URL(anchor.href, host);
				const { pathname } = u;
				if (pathname.startsWith("/")) {
					items.push({ tagName, textContent, pathname });
					continue;
				}
				// if (
				// if (u.toString() !== anchor.href) continue
				// if (!anchor

				// if (
				// 		items.push({ tagName, textContent, href });
				// continue;
			}
			// if (!text) {
			// 	text = { tagName: "p", textContent: "" };
			// }
			iterate(element);
		}
	}

	iterate(doc.body);
	if (text) items.push(text);

	const pathname = new URL(url).pathname.replace(new RegExp("^/browse"), "");
	return { pathname, title, items };
}

async function fetchDocument(url: string) {
	const resp = await fetch(url);
	const text = await resp.text();
	const parser = new DOMParser();
	return parser.parseFromString(text, "text/html");
}

main().catch((err) => {
	console.error(err);
});

interface Page {
	pathname: string;
	title: string;
	items: Item[];
}

type Item = HeadingItem | ParagraphItem | AnchorItem;

interface HeadingItem {
	tagName: string;
	textContent: string;
}

interface ParagraphItem {
	tagName: string;
	textContent: string;
}

interface AnchorItem {
	tagName: string;
	textContent: string;
	pathname: string;
}

declare global {
	const canvas: HTMLCanvasElement;
}
