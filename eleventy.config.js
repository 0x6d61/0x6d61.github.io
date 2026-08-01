import markdownIt from "markdown-it"

const siteUrl = "https://0x6d61.github.io"

function addObsidianSyntax(md) {
  md.inline.ruler.before("link", "obsidian-embed", (state, silent) => {
    const match = state.src.slice(state.pos).match(/^!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/)
    if (!match) return false

    if (!silent) {
      const filename = match[1].trim()
      const token = state.push("image", "img", 0)
      const alt = (match[2] || filename.replace(/\.[^.]+$/, "")).trim()
      token.attrs = [
        ["src", `/assets/${encodeURI(filename)}`],
        ["alt", alt],
        ["loading", "lazy"],
      ]
      const child = new state.Token("text", "", 0)
      child.content = alt
      token.children = [child]
    }

    state.pos += match[0].length
    return true
  })

  md.inline.ruler.before("link", "wikilink", (state, silent) => {
    const match = state.src.slice(state.pos).match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/)
    if (!match) return false

    if (!silent) {
      const target = match[1].trim()
      const label = (match[2] || target).trim()
      const open = state.push("link_open", "a", 1)
      open.attrs = [["href", `/${encodeURI(target)}/`]]
      const text = state.push("text", "", 0)
      text.content = label
      state.push("link_close", "a", -1)
    }

    state.pos += match[0].length
    return true
  })
}

export default function (eleventyConfig) {
  const md = markdownIt({ html: false, linkify: true, typographer: false })
  addObsidianSyntax(md)
  eleventyConfig.setLibrary("md", md)

  eleventyConfig.addPassthroughCopy({ "content/assets": "assets" })
  eleventyConfig.addPassthroughCopy({ static: "." })
  eleventyConfig.ignores.add("README.md")

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/*.md")
      .filter((item) => !item.inputPath.endsWith("index.md"))
      .sort((a, b) => b.date - a.date),
  )

  eleventyConfig.addCollection("allTags", (collectionApi) => {
    const tags = new Set()
    for (const post of collectionApi.getFilteredByGlob("content/*.md")) {
      for (const tag of post.data.tags || []) tags.add(tag)
    }
    return [...tags].sort((a, b) => a.localeCompare(b, "ja"))
  })

  eleventyConfig.addFilter("dateJa", (value) =>
    new Intl.DateTimeFormat("ja-JP", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value)),
  )
  eleventyConfig.addFilter("isoDate", (value) => new Date(value).toISOString())
  eleventyConfig.addFilter("absoluteUrl", (value) => new URL(value, siteUrl).href)
  eleventyConfig.addFilter("tagId", (value) => String(value).trim().replace(/\s+/g, "-"))
  eleventyConfig.addFilter("xmlEscape", (value = "") =>
    String(value).replace(/[<>&'\"]/g, (character) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    })[character]),
  )

  eleventyConfig.addGlobalData("site", {
    title: "Mind Injection",
    description: "サイバーセキュリティと技術の記録",
    url: siteUrl,
    author: "0x6d61",
  })
  eleventyConfig.addGlobalData("buildId", Date.now().toString(36))

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
  }
}
