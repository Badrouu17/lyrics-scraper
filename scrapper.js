const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

load_page = function (url) {
  return get_browser()
    .then(instantiate_page)
    .then(navigate_page.bind(null, url))
    .then(fetch_page_content)
    .catch(restart);
};

function get_browser() {
  return puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

function instantiate_page(browser) {
  return browser.newPage();
}

class PageLoadError extends Error {
  constructor(message, page, address) {
    super(message);
    this.page = page;
    this.address = address;
  }
}

function navigate_page(address, page) {
  return page
    .goto(address, { waitUntil: "networkidle2", timeout: 240000 })
    .then(() => Promise.resolve(page))
    .catch((err) => Promise.reject(new PageLoadError(err, page, address)));
}

function fetch_page_content(page) {
  return page.content().then(() => Promise.resolve(page));
}

function restart(error) {
  if (error instanceof PageLoadError) {
    error.page.close();
    return load_page(error.address);
  } else {
    throw error;
  }
}

function select_html(page) {
  return page.$eval(".lyrics", (el) => el.innerHTML);
}

function print_some_part_of_it(lyrics_html) {
  let ly;
  let $ = cheerio.load(lyrics_html, { decodeEntities: false });
  $("body")
    .contents()
    .each((i, e) => {
      if (e.tagName === "section") {
        ly = $(e.firstChild);
      }
    });
  ly.contents().each(function (i, elm) {
    if (elm.tagName === "a") {
      $(elm).removeAttr("href");
      $(elm).removeAttr("class");
      $(elm).removeAttr("data-id");
      $(elm).removeAttr("ng-click");
      $(elm).removeAttr("ng-class");
      $(elm).removeAttr("prevent-default-click");
      $(elm).removeAttr("annotation-fragment");
      $(elm).removeAttr("on-hover-with-no-digest");
      $(elm).removeAttr("classification");
      $(elm).removeAttr("image");
      $(elm).removeAttr("pending-editorial-actions-count");
    } else if (elm.tagName === "defer-compile") {
      $(elm).remove();
    }
  });
  return ly.html();
}

exports.getSongLyrics = (req, res, next) => {
  load_page(req.body.url)
    .then(select_html)
    .then(print_some_part_of_it)
    .then((ly) => {
      res.status(200).json({
        status: "success",
        data: ly,
      });
    })
    .catch((err) => res.status(400).json({ status: "failed", err }));
};
