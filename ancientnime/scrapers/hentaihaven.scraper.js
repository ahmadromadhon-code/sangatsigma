const axios = require('axios');
const cheerio = require('cheerio');

class HentaiHavenScraper {
    constructor() {
        this.baseUrl = 'https://hentaihaven.xxx';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    // Get latest hentai releases
    async getLatest(page = 1) {
        try {
            const url = page === 1 ? this.baseUrl : `${this.baseUrl}/page/${page}`;
            console.log('Fetching HentaiHaven latest from:', url);

            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            // Parse hentai items
            $('.post-item, .item, .hentai-item').each((index, element) => {
                try {
                    const $item = $(element);
                    
                    // Extract title
                    const titleElement = $item.find('h3 a, .title a, .post-title a').first();
                    const title = titleElement.text().trim();
                    
                    // Extract link
                    const link = titleElement.attr('href');
                    
                    // Extract image
                    const image = $item.find('img').first().attr('src') || 
                                 $item.find('img').first().attr('data-src');
                    
                    // Extract episodes if available
                    const episodes = [];
                    $item.find('.episode-list a, .episodes a').each((i, ep) => {
                        episodes.push({
                            title: $(ep).text().trim(),
                            url: $(ep).attr('href')
                        });
                    });

                    if (title && link) {
                        results.push({
                            title: title,
                            url: this.resolveUrl(link),
                            image: this.resolveUrl(image),
                            episodes: episodes,
                            source: 'hentaihaven',
                            type: 'hentai',
                            encoded_url: Buffer.from(this.resolveUrl(link)).toString('base64')
                        });
                    }
                } catch (itemError) {
                    console.error('Error parsing HentaiHaven item:', itemError.message);
                }
            });

            console.log(`HentaiHaven: Found ${results.length} items`);
            return results.slice(0, 10); // Limit to 10 items

        } catch (error) {
            console.error('HentaiHaven scraper error:', error.message);
            return this.getFallbackData();
        }
    }

    // Get hentai details and streaming info
    async getInfo(url) {
        try {
            console.log('Fetching HentaiHaven info from:', url);

            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });

            const $ = cheerio.load(response.data);

            // Extract basic info
            const title = $('h1, .entry-title, .post-title').first().text().trim();
            const description = $('.summary, .description, .content p').first().text().trim();
            const image = $('.post-thumb img, .entry-thumb img').first().attr('src');

            // Extract genres/tags
            const genres = [];
            $('.genre a, .tag a, .categories a').each((i, el) => {
                genres.push($(el).text().trim());
            });

            // Extract episodes
            const episodes = [];
            $('.episode-list a, .episodes a, .ep-list a').each((i, ep) => {
                episodes.push({
                    title: $(ep).text().trim(),
                    url: this.resolveUrl($(ep).attr('href'))
                });
            });

            // Generate streaming URLs (HentaiHaven specific)
            const streaming = this.generateHentaiHavenStreaming(url);

            return {
                title: title || 'HentaiHaven Content',
                description: description || 'Adult hentai content from HentaiHaven',
                image: this.resolveUrl(image),
                genres: genres,
                episodes: episodes,
                streaming: streaming,
                source: 'hentaihaven',
                url: url
            };

        } catch (error) {
            console.error('HentaiHaven info error:', error.message);
            return this.getFallbackInfo(url);
        }
    }

    // Generate HentaiHaven streaming URLs
    generateHentaiHavenStreaming(url) {
        const urlParts = url.split('/');
        const seriesName = urlParts[urlParts.length - 2] || 'hentai';
        const episodeName = urlParts[urlParts.length - 1] || 'episode-1';

        return {
            // HentaiHaven direct links (these would be real in production)
            hentaihaven: [
                url, // Direct HentaiHaven page
                `${this.baseUrl}/embed/${seriesName}/${episodeName}`,
                `${this.baseUrl}/player/${seriesName}/${episodeName}`
            ],
            
            // Alternative hentai streaming sources
            alternatives: [
                `https://hanime.tv/videos/hentai/${seriesName}-${episodeName}`,
                `https://hentaistream.com/watch/${seriesName}/${episodeName}`,
                `https://hentai.tv/video/${seriesName}-${episodeName}`
            ],

            // Demo videos for testing
            demo: [
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            ]
        };
    }

    // Search hentai
    async search(query, page = 1) {
        try {
            const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(query)}&page=${page}`;
            console.log('Searching HentaiHaven:', searchUrl);

            const response = await axios.get(searchUrl, {
                headers: this.headers,
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            $('.search-result, .post-item, .item').each((index, element) => {
                try {
                    const $item = $(element);
                    const title = $item.find('h3 a, .title a').first().text().trim();
                    const link = $item.find('h3 a, .title a').first().attr('href');
                    const image = $item.find('img').first().attr('src');

                    if (title && link) {
                        results.push({
                            title: title,
                            url: this.resolveUrl(link),
                            image: this.resolveUrl(image),
                            source: 'hentaihaven',
                            encoded_url: Buffer.from(this.resolveUrl(link)).toString('base64')
                        });
                    }
                } catch (itemError) {
                    console.error('Error parsing search result:', itemError.message);
                }
            });

            return results;

        } catch (error) {
            console.error('HentaiHaven search error:', error.message);
            return [];
        }
    }

    // Resolve relative URLs
    resolveUrl(url) {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('//')) return 'https:' + url;
        if (url.startsWith('/')) return this.baseUrl + url;
        return url;
    }

    // Fallback data when scraping fails
    getFallbackData() {
        return [
            {
                title: "[HentaiHaven] Inshoku Ou Demar Episode 1",
                url: "https://hentaihaven.xxx/watch/inshoku-ou-demar/episode-1",
                image: "https://img.hentaihaven.xxx/images/hh/v/b/s_inshoku-ou-demar.jpg",
                source: "hentaihaven",
                type: "hentai",
                encoded_url: Buffer.from("https://hentaihaven.xxx/watch/inshoku-ou-demar/episode-1").toString('base64')
            },
            {
                title: "[HentaiHaven] Mankitsu Happening Episode 1",
                url: "https://hentaihaven.xxx/watch/mankitsu-happening/episode-1",
                image: "https://img.hentaihaven.xxx/images/hh/v/b/s_Mankitsu-Happening.jpg",
                source: "hentaihaven",
                type: "hentai",
                encoded_url: Buffer.from("https://hentaihaven.xxx/watch/mankitsu-happening/episode-1").toString('base64')
            },
            {
                title: "[HentaiHaven] Nee Shiyo Episode 1",
                url: "https://hentaihaven.xxx/watch/nee-shiyo/episode-1",
                image: "https://img.hentaihaven.xxx/images/hh/v/b/s_Nee-Shiyo-hentaihaven.org_.jpg",
                source: "hentaihaven",
                type: "hentai",
                encoded_url: Buffer.from("https://hentaihaven.xxx/watch/nee-shiyo/episode-1").toString('base64')
            }
        ];
    }

    // Fallback info when scraping fails
    getFallbackInfo(url) {
        return {
            title: "[HentaiHaven] Adult Hentai Content",
            description: "High-quality hentai anime from HentaiHaven with multiple streaming options and HD quality.",
            image: "https://img.hentaihaven.xxx/theme/hh/Hentai-Haven-Logo.png",
            genres: ["Hentai", "Adult", "Anime", "HD"],
            episodes: [
                { title: "Episode 1", url: url }
            ],
            streaming: this.generateHentaiHavenStreaming(url),
            source: "hentaihaven",
            url: url
        };
    }
}

module.exports = new HentaiHavenScraper();
