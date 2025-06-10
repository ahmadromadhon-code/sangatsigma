const url = require("../helpers/base-url");
const { default: Axios } = require("axios");
const cheerio = require("cheerio");
const errors = require("../helpers/errors");

class AnimeController {
  detailAnime = async (req, res) => {
    const id = req.params.id;
    const fullUrl = url.baseUrl + `anime/${id}`;
    console.log('Fetching anime detail from:', fullUrl);
    try {
      const response = await Axios.get(fullUrl);
      console.log('Response status:', response.status);
      console.log('Response data length:', response.data.length);

      const $ = cheerio.load(response.data);
      console.log('Looking for .venser element...');
      const venser = $(".venser");
      console.log('Found .venser elements:', venser.length);

      if (venser.length === 0) {
        console.log('No .venser element found, checking page structure...');
        console.log('Page title:', $('title').text());
        console.log('Available classes:', $('[class]').map((i, el) => $(el).attr('class')).get().slice(0, 10));
      }

      const detailElement = $(".venser").find(".fotoanime");
      const epsElement = $("#_epslist").html();
      console.log('Detail element found:', detailElement.length > 0);
      console.log('Eps element found:', epsElement !== null);
      let object = {};
      let episode_list = [];
      object.thumb = detailElement.find("img").attr("src");
      object.anime_id = req.params.id
      let genre_name, genre_id, genre_link;
      let genreList = [];
      detailElement.find(".infozin").filter(function () {
        object.title = $(this)
          .find("p")
          .children()
          .eq(0)
          .text()
          .replace("Judul: ", "");
        object.japanase = $(this)
          .find("p")
          .children()
          .eq(1)
          .text()
          .replace("Japanese: ", "");
        object.score = $(this)
          .find("p")
          .children()
          .eq(2)
          .text()
          .replace("Skor: ", "");
        object.producer = $(this)
          .find("p")
          .children()
          .eq(3)
          .text()
          .replace("Produser:  ", "");
        object.type = $(this)
          .find("p")
          .children()
          .eq(4)
          .text()
          .replace("Tipe: ", "");
        object.status = $(this)
          .find("p")
          .children()
          .eq(5)
          .text()
          .replace("Status: ", "");
        object.total_episode = $(this)
          .find("p")
          .children()
          .eq(6)
          .text()
          .replace("Total Episode: ", "");
        object.duration = $(this)
          .find("p")
          .children()
          .eq(7)
          .text()
          .replace("Durasi: ", "");
        object.release_date = $(this)
          .find("p")
          .children()
          .eq(8)
          .text()
          .replace("Tanggal Rilis: ", "");
        object.studio = $(this)
          .find("p")
          .children()
          .eq(9)
          .text()
          .replace("Studio: ", "");
        $(this)
          .find("p")
          .children()
          .eq(10)
          .find("span > a")
          .each(function () {
            genre_name = $(this).text();
            genre_id = $(this)
              .attr("href")
              .replace("https://otakudesu.org/genres/", "");
            genre_link = $(this).attr("href");
            genreList.push({ genre_name, genre_id, genre_link });
            object.genre_list = genreList;
          });
      });

      // Try to find episode list directly from the page
      console.log('Looking for episode list in page...');
      const episode_links = [];

      // Look for episode links in various possible selectors
      const episodeSelectors = [
        '.episodelist ul li a',
        '.epslistplace ul li a',
        '.eps_lst ul li a',
        '.episode-list ul li a',
        'ul.eps_lst li a',
        '.venser .episodelist a',
        '.venser ul li a'
      ];

      let foundEpisodes = false;
      for (const selector of episodeSelectors) {
        const episodes = $(selector);
        console.log(`Checking selector "${selector}": found ${episodes.length} episodes`);

        if (episodes.length > 0) {
          episodes.each((i, elem) => {
            const $elem = $(elem);
            const episodeText = $elem.text().trim();
            const episodeLink = $elem.attr('href');

            if (episodeText && episodeLink) {
              const episode = {
                eps_name: episodeText,
                eps_link: episodeLink,
                eps_id: episodeLink.replace('https://otakudesu.cloud/', '').replace('https://otakudesu.org/', '')
              };
              episode_links.push(episode);
            }
          });
          foundEpisodes = true;
          break;
        }
      }

      if (!foundEpisodes) {
        console.log('No episodes found with standard selectors, checking page structure...');
        // Log available links for debugging
        const allLinks = $('a[href*="episode"]');
        console.log('Found episode-related links:', allLinks.length);
        allLinks.slice(0, 5).each((i, elem) => {
          console.log(`Link ${i}:`, $(elem).text().trim(), $(elem).attr('href'));
        });
      }

      object.episode_list = episode_links;

      // Try to find batch download links
      console.log('Looking for batch download links...');
      const batch_links = [];
      const batchSelectors = [
        '.batchlink a',
        '.batch-download a',
        '.download-batch a',
        'a[href*="batch"]'
      ];

      let foundBatch = false;
      for (const selector of batchSelectors) {
        const batches = $(selector);
        console.log(`Checking batch selector "${selector}": found ${batches.length} batches`);

        if (batches.length > 0) {
          batches.each((i, elem) => {
            const $elem = $(elem);
            const batchText = $elem.text().trim();
            const batchLink = $elem.attr('href');

            if (batchText && batchLink && batchLink.includes('batch')) {
              const batch = {
                batch_name: batchText,
                batch_link: batchLink,
                batch_id: batchLink.replace('https://otakudesu.cloud/batch/', '').replace('https://otakudesu.org/batch/', '')
              };
              batch_links.push(batch);
            }
          });
          foundBatch = true;
          break;
        }
      }

      const emptyBatch = [{
        batch_name: 'masih kosong',
        batch_link: 'masih kosong',
        batch_id: 'masih kosong',
      }];

      object.batch_link = batch_links.length === 0 ? emptyBatch : batch_links;
      object.status = 'success';
      object.baseUrl = fullUrl;

      //console.log(epsElement);
      res.json(object);
    } catch (err) {
      errors.requestFailed(req, res, err);
    }
  };
  batchAnime = async(req, res) => {
      const id = req.params.id
      const fullUrl = `${url.baseUrl}batch/${id}`
      console.log('Fetching batch from:', fullUrl);

      try {
        const response = await Axios.get(fullUrl);
        console.log('Batch response status:', response.status);

        const $ = cheerio.load(response.data);
        const obj = {};

        // Try multiple selectors for title
        const titleSelectors = [
          '.batchlink > h4',
          '.batch-title h4',
          '.entry-title',
          'h1.entry-title',
          '.post-title h1'
        ];

        for (const selector of titleSelectors) {
          const title = $(selector).text().trim();
          if (title) {
            obj.title = title;
            console.log(`Found batch title with "${selector}":`, title);
            break;
          }
        }

        obj.status = 'success';
        obj.baseUrl = fullUrl;

        let low_quality = _batchQualityFunction(0, response.data);
        let medium_quality = _batchQualityFunction(1, response.data);
        let high_quality = _batchQualityFunction(2, response.data);

        obj.download_list = {low_quality, medium_quality, high_quality};

        console.log('Batch object:', JSON.stringify(obj, null, 2));
        res.json(obj);

      } catch (err) {
        console.error('Batch fetch error:', err.message);
        errors.requestFailed(req, res, err);
      }
  }
  epsAnime = async (req,res) => {
    const id = req.params.id
    const fullUrl = `${url.baseUrl}episode/${id}`
    console.log('Fetching episode from:', fullUrl);

    try {
      const response = await Axios.get(fullUrl);
      console.log('Episode response status:', response.status);

      const $ = cheerio.load(response.data);
      const obj = {};

      // Try multiple selectors for title
      const titleSelectors = [
        '.venutama > h1',
        '.jdlrx h1',
        '.entry-title',
        'h1.entry-title',
        '.post-title h1'
      ];

      for (const selector of titleSelectors) {
        const title = $(selector).text().trim();
        if (title) {
          obj.title = title;
          console.log(`Found title with "${selector}":`, title);
          break;
        }
      }

      obj.baseUrl = fullUrl;
      obj.id = id;
      obj.status = 'success';

      // Try multiple selectors for streaming iframe
      const streamSelectors = [
        '#lightsVideo iframe',
        '#embed_holder iframe',
        '.player-embed iframe',
        '.video-content iframe',
        'iframe[src*="embed"]',
        'iframe[src*="player"]',
        '.venser iframe',
        '.entry-content iframe',
        'iframe[src*="otakudesu"]',
        'iframe[src*="drive.google"]',
        'iframe[src*="blogger"]',
        'iframe'
      ];

      let streamFound = false;
      for (const selector of streamSelectors) {
        const iframe = $(selector);
        console.log(`Checking selector "${selector}": found ${iframe.length} iframes`);

        if (iframe.length > 0) {
          iframe.each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && !streamFound) {
              // Clean and validate the stream URL
              let cleanSrc = src;
              if (src.startsWith('//')) {
                cleanSrc = 'https:' + src;
              } else if (src.startsWith('/')) {
                cleanSrc = 'https://otakudesu.cloud' + src;
              }

              obj.link_stream = cleanSrc;
              console.log(`Found stream with "${selector}":`, cleanSrc);
              streamFound = true;
              return false; // Break out of each loop
            }
          });

          if (streamFound) break;
        }
      }

      // If no iframe found, try to find video sources
      if (!streamFound) {
        console.log('No iframe found, looking for video sources...');
        const videoSources = [
          'video source',
          'video[src]',
          'source[src]'
        ];

        for (const selector of videoSources) {
          const video = $(selector);
          if (video.length > 0) {
            const src = video.attr('src');
            if (src) {
              obj.link_stream = src;
              console.log(`Found video source:`, src);
              streamFound = true;
              break;
            }
          }
        }
      }

      // If still no stream found, try to extract from script tags
      if (!streamFound) {
        console.log('Looking for stream URLs in script tags...');
        $('script').each((i, elem) => {
          const scriptContent = $(elem).html();
          if (scriptContent) {
            // Look for common video URL patterns
            const urlPatterns = [
              /src["\s]*:["\s]*["']([^"']+\.mp4[^"']*)/gi,
              /url["\s]*:["\s]*["']([^"']+\.mp4[^"']*)/gi,
              /file["\s]*:["\s]*["']([^"']+\.mp4[^"']*)/gi,
              /"(https?:\/\/[^"]+\.mp4[^"]*)"/gi,
              /"(https?:\/\/[^"]+embed[^"]*)"/gi,
              /"(https?:\/\/drive\.google\.com[^"]*)"/gi,
              /"(https?:\/\/[^"]+blogger[^"]*)"/gi
            ];

            for (const pattern of urlPatterns) {
              const matches = scriptContent.match(pattern);
              if (matches && matches.length > 0) {
                // Extract the URL from the match
                const match = matches[0];
                const urlMatch = match.match(/["']([^"']+)["']/);
                if (urlMatch && urlMatch[1]) {
                  obj.link_stream = urlMatch[1];
                  console.log('Found stream URL in script:', urlMatch[1]);
                  streamFound = true;
                  return false; // Break out of each loop
                }
              }
            }
          }
        });
      }

      // If still no stream, provide fallback options
      if (!streamFound) {
        console.log('No stream found, checking for alternative sources...');

        // Look for any links that might be streaming sources
        const potentialSources = [];
        $('a[href*="drive.google.com"], a[href*="youtube.com"], a[href*="embed"]').each((i, elem) => {
          const href = $(elem).attr('href');
          if (href) {
            potentialSources.push(href);
          }
        });

        if (potentialSources.length > 0) {
          obj.link_stream = potentialSources[0];
          obj.alternative_sources = potentialSources;
          console.log('Found alternative sources:', potentialSources.length);
          streamFound = true;
        }
      }

      // Add debug info
      obj.debug_info = {
        selectors_tried: streamSelectors.length,
        scripts_checked: $('script').length,
        iframes_found: $('iframe').length,
        stream_found: streamFound,
        page_title: $('title').text(),
        timestamp: new Date().toISOString()
      };

      // Try to find download links
      console.log('Looking for download links...');
      let low_quality = _epsQualityFunction(0, response.data);
      let medium_quality = _epsQualityFunction(1, response.data);
      let high_quality = _epsQualityFunction(2, response.data);

      obj.quality = {low_quality, medium_quality, high_quality};

      console.log('Episode object:', JSON.stringify(obj, null, 2));
      res.json(obj);

    } catch (err) {
      console.error('Episode fetch error:', err.message);
      errors.requestFailed(req, res, err);
    }
  }
}

function _batchQualityFunction(num, res) {
  const $ = cheerio.load(res);
  const download_links = [];
  let response = null;

  console.log(`Looking for batch quality ${num}...`);

  // Try multiple selectors for batch download section
  const downloadSelectors = [
    '.download .batchlink',
    '.batchlink',
    '.download',
    '.batch-download',
    '.download-links',
    '.dl-box'
  ];

  for (const selector of downloadSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      console.log(`Found batch download section with "${selector}"`);

      // Try to find quality lists
      const qualitySelectors = ['ul', '.quality-list', '.download-list'];

      for (const qSelector of qualitySelectors) {
        element.find(qSelector).each(function() {
          const qualityItem = $(this).find('li').eq(num);
          if (qualityItem.length > 0) {
            const quality = qualityItem.find('strong').text().trim();
            const size = qualityItem.find('i').text().trim();

            console.log(`Found quality item ${num}: ${quality} - ${size}`);

            qualityItem.find('a').each(function() {
              const host = $(this).text().trim();
              const link = $(this).attr('href');

              if (host && link) {
                download_links.push({
                  host: host,
                  link: link
                });
              }
            });

            if (download_links.length > 0) {
              response = {
                quality: quality || `Batch Quality ${num + 1}`,
                size: size || 'Unknown size',
                download_links: download_links
              };
              return false; // Break out of each loop
            }
          }
        });

        if (response) break;
      }

      if (response) break;
    }
  }

  console.log(`Batch quality ${num} result:`, response ? `${response.download_links.length} links` : 'none');
  return response;
}
function _epsQualityFunction(num, res) {
  const $ = cheerio.load(res);
  const download_links = [];
  let response = null;

  // Try multiple selectors for download section
  const downloadSelectors = [
    '.download',
    '.download-eps',
    '.download-links',
    '.episode-download',
    '.dl-box'
  ];

  for (const selector of downloadSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      console.log(`Found download section with "${selector}"`);

      // Try to find quality lists
      const qualitySelectors = ['ul', '.quality-list', '.download-list'];

      for (const qSelector of qualitySelectors) {
        element.find(qSelector).each(function() {
          const qualityItem = $(this).find('li').eq(num);
          if (qualityItem.length > 0) {
            const quality = qualityItem.find('strong').text().trim();
            const size = qualityItem.find('i').text().trim();

            qualityItem.find('a').each(function() {
              const host = $(this).text().trim();
              const link = $(this).attr('href');

              if (host && link) {
                download_links.push({
                  host: host,
                  link: link
                });
              }
            });

            if (download_links.length > 0) {
              response = {
                quality: quality || `Quality ${num + 1}`,
                size: size || 'Unknown size',
                download_links: download_links
              };
              return false; // Break out of each loop
            }
          }
        });

        if (response) break;
      }

      if (response) break;
    }
  }

  console.log(`Quality ${num} result:`, response ? `${response.download_links.length} links` : 'none');
  return response;
}

module.exports = new AnimeController();
