/**
 * @author Moe Poi <moepoi@protonmail.com>
 * @license MIT
 */
"use strict";

const axios = require('axios');
const cheerio = require('cheerio');

const getInfo = url => {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
      .then(req => {
        try {
          const links = [];
          let soup = cheerio.load(req.data);
          let title = soup("title").text();
          soup('div.liner').each(function(i, e) {
            soup(e).find('div.listlink').each(function(j, s) {
              links.push(soup(s).find('a').attr('href'))
            });
          });
          const data = {
            "title": title,
            "links": links
          };
          resolve(data)
        } catch (err) {
          reject('Error : ' + err)
        }
      })
      .catch(error => {
        reject(`Error fetching data: ${error.message}`);
      })
  });
};

module.exports = getInfo;
