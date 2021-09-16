import { assert, assertStrictEquals as equals } from "../deps/assert.ts";
import { build, getSite, testPage } from "./utils.ts";
import postcss from "../plugins/postcss.ts";

Deno.test("terser plugin", async () => {
  const site = getSite({
    test: true,
    src: "postcss",
  });

  site.use(postcss());

  await build(site);

  equals(site.pages.length, 2);

  // Register the .svg loader
  assert(site.source.assets.has(".css"));
  assert(site.source.pages.has(".css"));

  testPage(site, "/index", (page) => {
    equals(page.data.url, "/index.css");
    equals(
      page.content,
      `::root {
  --color: #333;
  --background: #fff;
  --font-family: sans-serif;
}
.text {
  font-family: var(--font-family)
}
.text p {
    color: var(--color);
    box-shadow: 0 0 0.5em var(--background);
    -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
  }
`,
    );
  });
});