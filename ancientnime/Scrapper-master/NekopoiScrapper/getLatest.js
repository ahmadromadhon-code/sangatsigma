/**
 * @author Moe Poi <moepoi@protonmail.com>
 * @license MIT
 */
"use strict";

const axios = require('axios');
const cheerio = require('cheerio');

const getLatest = () => {
  return new Promise((resolve, reject) => {
    const url = 'https://nekopoi.care';
    axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
      .then(req => {
        const title = [];
        const link = [];
        const image = [];
        const data = [];
        const soup = cheerio.load(req.data);
        soup('div.eropost').each(function(i, e) {
          soup(e).find('h2').each(function(j, s) {
            title.push(soup(s).find('a').text().trim());
            const linkHref = soup(s).find('a').attr('href');
            // Fix URL handling - avoid double URL prefix
            if (linkHref && linkHref.startsWith('http')) {
              link.push(linkHref);
            } else if (linkHref) {
              link.push(url + linkHref);
            }
          });
          const imgSrc = soup(e).find('img').attr('src');
          // Fix image URL handling - avoid double URL prefix
          if (imgSrc && imgSrc.startsWith('http')) {
            image.push(imgSrc);
          } else if (imgSrc) {
            image.push(url + imgSrc);
          }
        });
        var i;
        for (i = 0; i < title.length; i++) {
          let isi = {
            "title": title[i],
            "image": image[i],
            "link": link[i]
          };
          data.push(isi);
        }
        if (data == undefined) {
          reject("No result :(");
        } else {
          var result = JSON.stringify(data, null, 2);
          resolve(result);
        }
      })
      .catch(error => {
        reject(`Error fetching data: ${error.message}`);
      });
  });
};

module.exports = getLatest;
