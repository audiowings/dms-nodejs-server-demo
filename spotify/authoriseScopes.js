const puppeteer = require('puppeteer');

async function authoriseScopes (url)  {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const res = await  page.goto(url);
  console.log(await page.content());

  await browser.close();
};

exports.authoriseScopes = authoriseScopes