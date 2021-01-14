export default class Search {
  #site = null;
  #cache = null;

  constructor(site) {
    this.#site = site;
    this.#cache = new Map();

    site.addEventListener("beforeUpdate", () => this.#cache.clear());
  }

  folder(path = "/") {
    return this.#site.source.getDirectory(path);
  }

  pages(tags, sort) {
    return this.#searchPages(tags, sort);
  }

  tags(exclude) {
    exclude = getTags(exclude);
    const tags = new Set();

    this.#site.pages.forEach((page) => {
      page.tags.forEach((tag) => {
        if (!exclude || !exclude.includes(tag)) {
          tags.add(tag);
        }
      });
    });

    return Array.from(tags);
  }

  nextPage(url, tags, sort) {
    const pages = this.pages(tags, sort);
    const index = pages.findIndex((page) => page.data.url === url);

    return (index === -1) ? undefined : pages[index + 1];
  }

  previousPage(url, tags, sort) {
    const pages = this.pages(tags, sort);
    const index = pages.findIndex((page) => page.data.url === url);

    return (index <= 0) ? undefined : pages[index - 1];
  }

  #searchPages(tags = [], sort = "date") {
    tags = getTags(tags);
    const id = JSON.stringify([tags, sort]);

    if (this.#cache.has(id)) {
      return this.#cache.get(id);
    }

    const filter = (page) => {
      if (page.dest.ext !== ".html") {
        return false;
      }

      if (tags && !tags.every((tag) => page.tags.has(tag))) {
        return false;
      }

      return true;
    };

    const result = this.#site.pages
      .filter(filter)
      .sort((a, b) => {
        if (sort === "file") {
          return (a.src.path < b.src.path) ? -1 : 1;
        }

        return (a.data[sort] < b.data[sort]) ? -1 : 1;
      });

    this.#cache.set(id, result);
    return result;
  }
}

function getTags(tags) {
  if (!tags) {
    return null;
  }

  if (typeof tags === "string") {
    tags = tags.split(/\s+/).filter((tag) => tag);
  }

  return tags.length ? tags : null;
}
