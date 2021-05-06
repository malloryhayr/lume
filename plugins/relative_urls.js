import { posix } from "../deps/path.js";
import { DOMParser } from "../deps/dom.js";
import { documentToString } from "../utils.js";

export default function () {
  const parser = new DOMParser();

  return (site) => {
    site.process([".html"], processor);

    const basePath = site.options.location.pathname;

    function processor(page) {
      const document = parser.parseFromString(page.content, "text/html");
      const from = posix.dirname(site.url(page.dest.path));

      document.querySelectorAll("[href]").forEach((element) => {
        element.setAttribute(
          "href",
          relativeUrl(basePath, from, element.getAttribute("href")),
        );
      });

      document.querySelectorAll("[src]").forEach((element) => {
        element.setAttribute(
          "src",
          relativeUrl(basePath, from, element.getAttribute("src")),
        );
      });

      const srcsetUrlRegex =
        /(?<=^\s*|,\s+|\s,+|\s[^\s,]+,+)[^\s,](?:\S*[^\s,])?/g;

      document.querySelectorAll("[srcset]").forEach((element) => {
        element.setAttribute(
          "srcset",
          element.getAttribute("srcset").replace(
            srcsetUrlRegex,
            (url) => relativeUrl(basePath, from, url),
          ),
        );
      });

      document.querySelectorAll("[imagesrcset]").forEach((element) => {
        element.setAttribute(
          "imagesrcset",
          element.getAttribute("imagesrcset").replace(
            srcsetUrlRegex,
            (url) => relativeUrl(basePath, from, url),
          ),
        );
      });

      page.content = documentToString(document);
    }
  };
}

function relativeUrl(basePath, from, to) {
  if (ignore(to)) {
    return to;
  }

  if (!to.startsWith(basePath)) {
    to = posix.join(basePath, to);
  }

  const relative = posix.relative(from, to);

  if (!relative || relative.startsWith("/")) {
    return `.${relative}`;
  }

  return relative;
}

function ignore(url) {
  return !url ||
    url.startsWith("./") ||
    url.startsWith("../") ||
    url.startsWith("#") ||
    url.startsWith("?") ||
    url.includes("//");
}