"""Refresh the docs catalogue from the published IIIF Cookbook (Python stdlib only)."""

import json
import re
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urldefrag
from urllib.request import urlopen

SOURCE = "https://iiif.io/api/cookbook/"


class Page(HTMLParser):
    def __init__(self, url):
        super().__init__()
        self.links = []
        self.samples = []
        self.title = ""
        self.heading = False
        self.link = None
        with urlopen(url, timeout=30) as response:
            self.feed(response.read().decode())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1" and not self.title:
            self.heading = True
        if tag == "a":
            self.link = [attrs.get("href", ""), ""]
        if tag == "pre" and attrs.get("data-src", "").endswith(".json"):
            self.samples.append(attrs["data-src"])

    def handle_data(self, data):
        if self.heading:
            self.title += data
        if self.link is not None:
            self.link[1] += data

    def handle_endtag(self, tag):
        if tag == "h1":
            self.heading = False
        if tag == "a" and self.link is not None:
            self.links.append(self.link)
            self.link = None


def recipe(url):
    page = Page(url)
    samples = [href for href, text in page.links if text.strip() == "JSON-LD"] + page.samples
    return {
        "id": url.rstrip("/").split("/")[-1],
        "title": page.title.strip(),
        "url": url,
        "resources": list(dict.fromkeys(urljoin(url, href) for href in samples)),
    }


if __name__ == "__main__":
    urls = dict.fromkeys(
        urldefrag(urljoin(SOURCE, href))[0].rstrip("/") + "/"
        for href, _ in Page(SOURCE).links
        if re.search(r"/recipe/\d{4}-", href)
    )
    with ThreadPoolExecutor(max_workers=8) as pool:
        recipes = list(pool.map(recipe, urls))
    assert recipes and all(item["title"] for item in recipes)
    target = Path(__file__).resolve().parents[1] / "src/data/cookbook.json"
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps({"source": SOURCE, "recipes": recipes}, indent=2) + "\n")
    print(f"Saved {len(recipes)} recipes to {target}")
