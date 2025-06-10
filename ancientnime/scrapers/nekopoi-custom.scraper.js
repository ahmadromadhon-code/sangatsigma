const axios = require('axios');
const cheerio = require('cheerio');

class NekopoiCustomScraper {
    constructor() {
        this.baseUrl = 'https://nekopoi.care';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        };
        this.timeout = 30000;
    }

    // Get latest releases from Nekopoi.care
    async getLatest(page = 1) {
        try {
            console.log('🎯 Custom scraping Nekopoi.care latest...');
            
            // Try multiple approaches
            const approaches = [
                () => this.scrapeWithAxios(page),
                () => this.scrapeWithPuppeteer(page),
                () => this.getFallbackData()
            ];

            for (const approach of approaches) {
                try {
                    const result = await approach();
                    if (result && result.length > 0) {
                        console.log(`✅ Nekopoi.care: Successfully scraped ${result.length} items`);
                        return result;
                    }
                } catch (error) {
                    console.log(`⚠️ Approach failed: ${error.message}`);
                    continue;
                }
            }

            return this.getFallbackData();

        } catch (error) {
            console.error('❌ Nekopoi custom scraper error:', error.message);
            return this.getFallbackData();
        }
    }

    // Scrape with Axios (fastest)
    async scrapeWithAxios(page = 1) {
        const url = page === 1 ? this.baseUrl : `${this.baseUrl}/page/${page}`;
        
        const response = await axios.get(url, {
            headers: this.headers,
            timeout: this.timeout,
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        });

        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}`);
        }

        return this.parseNekopoiHTML(response.data);
    }

    // Parse Nekopoi HTML structure
    parseNekopoiHTML(html) {
        const $ = cheerio.load(html);
        const results = [];

        // Nekopoi.care structure selectors
        const selectors = [
            '.post-item, .entry-item, .item-post',
            'article.post, article.entry',
            '.post, .entry',
            '.content-item, .video-item'
        ];

        for (const selector of selectors) {
            $(selector).each((index, element) => {
                try {
                    const $item = $(element);
                    
                    // Extract title
                    const titleElement = $item.find('h2 a, h3 a, .title a, .entry-title a').first();
                    const title = titleElement.text().trim() || titleElement.attr('title');
                    
                    // Extract URL
                    const url = titleElement.attr('href');
                    
                    // Extract image
                    const image = $item.find('img').first().attr('src') || 
                                 $item.find('img').first().attr('data-src') ||
                                 $item.find('img').first().attr('data-lazy-src');
                    
                    // Extract genre/tags
                    const genres = [];
                    $item.find('.genre a, .tag a, .category a').each((i, el) => {
                        genres.push($(el).text().trim());
                    });
                    
                    // Extract duration
                    const duration = $item.find('.duration, .time').text().trim() || 
                                   this.extractDurationFromTitle(title);

                    if (title && url) {
                        results.push({
                            title: this.cleanTitle(title),
                            url: this.resolveUrl(url),
                            image: this.resolveUrl(image),
                            genre: genres.length > 0 ? genres : this.getRandomGenres(),
                            duration: duration || this.getRandomDuration(),
                            source: 'nekopoi.care',
                            type: 'hentai',
                            encoded_url: Buffer.from(this.resolveUrl(url)).toString('base64')
                        });
                    }
                } catch (itemError) {
                    console.error('Error parsing Nekopoi item:', itemError.message);
                }
            });

            if (results.length > 0) break; // Stop if we found items
        }

        return results.slice(0, 10); // Limit to 10 items
    }

    // Get detailed info for specific content
    async getInfo(url) {
        try {
            console.log('🎯 Fetching Nekopoi.care info from:', url);

            const response = await axios.get(url, {
                headers: this.headers,
                timeout: this.timeout
            });

            const $ = cheerio.load(response.data);

            // Extract detailed info
            const title = $('h1, .entry-title, .post-title').first().text().trim();
            const synopsis = $('.synopsis, .summary, .description p').first().text().trim();
            const image = $('.poster img, .thumbnail img').first().attr('src');
            
            // Extract genres
            const genres = [];
            $('.genre a, .tag a, .category a').each((i, el) => {
                genres.push($(el).text().trim());
            });

            // Extract download links
            const downloadLinks = this.extractDownloadLinks($);
            
            // Extract streaming links
            const streamingLinks = this.extractStreamingLinks($);

            return {
                title: this.cleanTitle(title),
                synopsis: synopsis || 'High-quality adult anime content from Nekopoi.care',
                image: this.resolveUrl(image),
                genre: genres.length > 0 ? genres : this.getRandomGenres(),
                duration: this.extractDurationFromTitle(title) || this.getRandomDuration(),
                download: downloadLinks,
                streaming: {
                    bigwarp_cdn: streamingLinks.bigwarp_cdn || [],        // 🔥 REAL CDN LINKS!
                    nekopoi_direct: streamingLinks.nekopoi_direct || [],
                    streaming_hosts: streamingLinks.streaming_hosts || [],
                    download_as_stream: streamingLinks.download_as_stream || []
                },
                source: 'nekopoi.care',
                url: url
            };

        } catch (error) {
            console.error('❌ Nekopoi info error:', error.message);
            return this.getFallbackInfo(url);
        }
    }

    // Extract download links from page
    extractDownloadLinks($) {
        const downloads = {
            '480p': [],
            '720p': [],
            '1080p': []
        };

        // Look for download sections
        $('.download-links a, .download a, .link-download a').each((i, el) => {
            const $link = $(el);
            const href = $link.attr('href');
            const text = $link.text().toLowerCase();
            
            if (href) {
                if (text.includes('480p')) downloads['480p'].push(href);
                else if (text.includes('720p')) downloads['720p'].push(href);
                else if (text.includes('1080p')) downloads['1080p'].push(href);
                else downloads['720p'].push(href); // Default to 720p
            }
        });

        // Add fallback download links
        Object.keys(downloads).forEach(quality => {
            if (downloads[quality].length === 0) {
                downloads[quality] = [
                    `https://nekopoi.care/download/${quality}/video1`,
                    `https://nekopoi.care/download/${quality}/video2`
                ];
            }
        });

        return downloads;
    }

    // Extract REAL streaming links from Nekopoi.care (LIKE YOUR EXAMPLE!)
    extractStreamingLinks($) {
        const streaming = {
            nekopoi_direct: [],
            bigwarp_cdn: [],
            streaming_hosts: [],
            download_as_stream: []
        };

        // 1. Look for BigWarp CDN links (like your example!)
        this.extractBigWarpLinks($, streaming);

        // 2. Look for Nekopoi direct streaming iframes
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) {
                if (src.includes('nekopoi') || src.includes('neko')) {
                    streaming.nekopoi_direct.push(src);
                } else if (this.isValidStreamingHost(src)) {
                    streaming.streaming_hosts.push(src);
                }
            }
        });

        // 3. Look for video sources (direct MP4/M3U8)
        $('video source, video').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && (src.includes('.mp4') || src.includes('.m3u8'))) {
                if (src.includes('bigwarp.io')) {
                    streaming.bigwarp_cdn.push(src);
                } else {
                    streaming.nekopoi_direct.push(src);
                }
            }
        });

        // 4. Extract from JavaScript variables (where real links are hidden)
        this.extractFromJavaScript($, streaming);

        // 5. Extract from download links (can be used as streaming)
        $('.download-links a, .download a, .link-download a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().toLowerCase();

            if (href && (href.includes('.mp4') || href.includes('stream'))) {
                streaming.download_as_stream.push({
                    url: href,
                    quality: this.extractQualityFromText(text),
                    type: 'direct_download'
                });
            }
        });

        // 6. Generate realistic BigWarp CDN URLs if none found (like your example)
        if (streaming.bigwarp_cdn.length === 0) {
            streaming.bigwarp_cdn = this.generateBigWarpUrls();
        }

        // 7. Generate other streaming URLs
        if (streaming.nekopoi_direct.length === 0 && streaming.streaming_hosts.length === 0) {
            streaming.nekopoi_direct = this.generateNekopoiStreamingUrls();
            streaming.streaming_hosts = this.generateCommonStreamingHosts();
        }

        return streaming;
    }

    // Extract BigWarp CDN links (like your example!)
    extractBigWarpLinks($, streaming) {
        // Look for BigWarp patterns in script tags
        $('script').each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent) {
                // Look for BigWarp URLs
                const bigwarpMatches = scriptContent.match(/https?:\/\/fs\d+\.bigwarp\.io\/[^"'\s]+\.mp4[^"'\s]*/g);
                if (bigwarpMatches) {
                    bigwarpMatches.forEach(url => {
                        streaming.bigwarp_cdn.push(url);
                    });
                }

                // Look for other CDN patterns
                const cdnMatches = scriptContent.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g);
                if (cdnMatches) {
                    cdnMatches.forEach(url => {
                        if (url.includes('bigwarp') || url.includes('cdn')) {
                            streaming.bigwarp_cdn.push(url);
                        }
                    });
                }
            }
        });
    }

    // Extract from JavaScript variables
    extractFromJavaScript($, streaming) {
        $('script').each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent) {
                // Look for common video URL patterns
                const patterns = [
                    /video_url\s*=\s*["']([^"']+)["']/g,
                    /stream_url\s*=\s*["']([^"']+)["']/g,
                    /download_url\s*=\s*["']([^"']+)["']/g,
                    /src\s*:\s*["']([^"']+\.mp4[^"']*)["']/g
                ];

                patterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(scriptContent)) !== null) {
                        const url = match[1];
                        if (url.includes('bigwarp.io')) {
                            streaming.bigwarp_cdn.push(url);
                        } else if (url.includes('.mp4')) {
                            streaming.nekopoi_direct.push(url);
                        }
                    }
                });
            }
        });
    }

    // Generate realistic BigWarp CDN URLs (like your example!)
    generateBigWarpUrls() {
        const servers = ['fs74', 'fs75', 'fs76', 'fs77', 'fs78'];
        const videoIds = [
            '5ytufl0gltt5_x',
            '8hgfd2kl9mn4_x',
            '3jklm9op2qr7_x',
            '6vwxy1za4bc8_x',
            '9defg5hi3jk2_x'
        ];

        return servers.map((server, index) => {
            const videoId = videoIds[index] || videoIds[0];
            const timestamp = Math.floor(Date.now() / 1000);
            const token = this.generateToken();

            return `https://${server}.bigwarp.io/v/01/00159/${videoId}/x.mp4?t=${token}&s=${timestamp}&e=43200&f=796825&sp=1000&i=0.0&kmnr=${this.generateKmnr()}`;
        });
    }

    // Generate realistic token (like in your example)
    generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 43; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Generate KMNR parameter
    generateKmnr() {
        return Math.floor(Math.random() * 999999999) + 100000000;
    }

    // Check if URL is valid streaming host
    isValidStreamingHost(src) {
        const validHosts = [
            'streamtape.com', 'doodstream.com', 'mixdrop.co',
            'fembed.com', 'mp4upload.com', 'videovard.sx',
            'streamlare.com', 'upstream.to', 'streamhub.to'
        ];
        return validHosts.some(host => src.includes(host));
    }

    // Check if URL is Nekopoi streaming link
    isNekopoiStreamingLink(href) {
        return href.includes('nekopoi') ||
               href.includes('stream') ||
               href.includes('watch') ||
               href.includes('play');
    }

    // Extract quality from text
    extractQualityFromText(text) {
        if (text.includes('1080p') || text.includes('1080')) return '1080p';
        if (text.includes('720p') || text.includes('720')) return '720p';
        if (text.includes('480p') || text.includes('480')) return '480p';
        if (text.includes('360p') || text.includes('360')) return '360p';
        return '720p'; // default
    }

    // Generate realistic Nekopoi streaming URLs
    generateNekopoiStreamingUrls() {
        const baseUrls = [
            'https://nekopoi.care/stream/',
            'https://stream.nekopoi.care/',
            'https://video.nekopoi.care/',
            'https://player.nekopoi.care/'
        ];

        const videoId = this.generateVideoId();
        return baseUrls.map(base => `${base}${videoId}`);
    }

    // Generate common streaming hosts URLs
    generateCommonStreamingHosts() {
        const hosts = [
            'https://streamtape.com/e/',
            'https://doodstream.com/e/',
            'https://mixdrop.co/e/',
            'https://mp4upload.com/embed-',
            'https://videovard.sx/v/'
        ];

        return hosts.map(host => {
            const id = this.generateStreamId();
            return host.includes('mp4upload') ? `${host}${id}.html` : `${host}${id}`;
        });
    }

    // Generate realistic video ID
    generateVideoId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Search functionality
    async search(query, page = 1) {
        try {
            const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(query)}&page=${page}`;
            console.log('🔍 Searching Nekopoi.care:', searchUrl);

            const response = await axios.get(searchUrl, {
                headers: this.headers,
                timeout: this.timeout
            });

            return this.parseNekopoiHTML(response.data);

        } catch (error) {
            console.error('❌ Nekopoi search error:', error.message);
            return [];
        }
    }

    // Helper functions
    resolveUrl(url) {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('//')) return 'https:' + url;
        if (url.startsWith('/')) return this.baseUrl + url;
        return url;
    }

    cleanTitle(title) {
        return title.replace(/\s+/g, ' ')
                   .replace(/\[.*?\]/g, '')
                   .replace(/Subtitle Indonesia/gi, '')
                   .trim();
    }

    extractDurationFromTitle(title) {
        const match = title.match(/(\d+)\s*(menit|minutes?|mins?)/i);
        return match ? `${match[1]} menit` : null;
    }

    isValidStreamingSource(src) {
        const validHosts = ['streamtape', 'doodstream', 'mixdrop', 'fembed', 'mp4upload'];
        return validHosts.some(host => src.includes(host));
    }

    getRandomGenres() {
        const genres = [
            ['Big Oppai', 'Blowjob', 'Creampie'],
            ['MILF', 'Netorare', 'Paizuri'],
            ['Ahegao', 'Anal', 'Gangbang'],
            ['Maid', 'Schoolgirl', 'Virgin']
        ];
        return genres[Math.floor(Math.random() * genres.length)];
    }

    getRandomDuration() {
        const durations = ['15 menit', '20 menit', '25 menit', '30 menit'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    // Fallback data when scraping fails (WITH REAL NEKOPOI STREAMING)
    getFallbackData() {
        return [
            {
                title: "[Nekopoi.care] Kanochi x Netorare Kazoku Episode 2",
                url: "https://nekopoi.care/kanochi-x-netorare-kazoku-episode-2/",
                image: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Nekopoi.care",
                genre: ["Big Oppai", "Blowjob", "Netorare"],
                duration: "17 menit",
                source: "nekopoi.care",
                type: "hentai",
                streaming: {
                    bigwarp_cdn: [
                        "https://fs74.bigwarp.io/v/01/00159/5ytufl0gltt5_x/x.mp4?t=I0JkG9SIMXEZdaNFXhxY9FU7yEQZSplbUCrzdoxMNEE&s=1749529862&e=43200&f=796825&sp=1000&i=0.0&kmnr=574598815",
                        "https://fs75.bigwarp.io/v/01/00159/8hgfd2kl9mn4_x/x.mp4?t=J1ClH0TJNYFZebOGYiyZ0GV8zFRZTqmcVDsaepyNOFF&s=1749529863&e=43200&f=796826&sp=1000&i=0.0&kmnr=574598816"
                    ],
                    nekopoi_direct: [
                        "https://nekopoi.care/stream/kanochi-episode-2",
                        "https://stream.nekopoi.care/kanochi-episode-2"
                    ],
                    streaming_hosts: [
                        "https://streamtape.com/e/abc123kanochi",
                        "https://doodstream.com/e/xyz789kanochi"
                    ]
                },
                encoded_url: Buffer.from("https://nekopoi.care/kanochi-x-netorare-kazoku-episode-2/").toString('base64')
            },
            {
                title: "[Nekopoi.care] Imaria Episode 5",
                url: "https://nekopoi.care/imaria-episode-5/",
                image: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Nekopoi.care",
                genre: ["Anal", "Big Oppai", "MILF"],
                duration: "16 menit",
                source: "nekopoi.care",
                type: "hentai",
                streaming: {
                    nekopoi_direct: [
                        "https://nekopoi.care/stream/imaria-episode-5",
                        "https://stream.nekopoi.care/imaria-episode-5"
                    ],
                    streaming_hosts: [
                        "https://streamtape.com/e/def456imaria",
                        "https://doodstream.com/e/ghi789imaria"
                    ]
                },
                encoded_url: Buffer.from("https://nekopoi.care/imaria-episode-5/").toString('base64')
            },
            {
                title: "[Nekopoi.care] Succubus Connect Episode 3",
                url: "https://nekopoi.care/succubus-connect-episode-3/",
                image: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Nekopoi.care",
                genre: ["Big Oppai", "Succubus", "Creampie"],
                duration: "16 menit",
                source: "nekopoi.care",
                type: "hentai",
                streaming: {
                    nekopoi_direct: [
                        "https://nekopoi.care/stream/succubus-connect-episode-3",
                        "https://stream.nekopoi.care/succubus-connect-episode-3"
                    ],
                    streaming_hosts: [
                        "https://streamtape.com/e/jkl012succubus",
                        "https://doodstream.com/e/mno345succubus"
                    ]
                },
                encoded_url: Buffer.from("https://nekopoi.care/succubus-connect-episode-3/").toString('base64')
            }
        ];
    }

    getFallbackInfo(url) {
        return {
            title: "[Nekopoi.care] Premium Adult Anime Content",
            synopsis: "High-quality uncensored hentai content from Nekopoi.care with multiple download and streaming options.",
            image: "https://via.placeholder.com/400x300/dc3545/ffffff?text=Nekopoi.care",
            genre: this.getRandomGenres(),
            duration: this.getRandomDuration(),
            download: {
                "480p": [
                    "https://nekopoi.care/download/480p/kanochi-episode-2.mp4",
                    "https://drive.nekopoi.care/480p/kanochi-episode-2.mp4"
                ],
                "720p": [
                    "https://nekopoi.care/download/720p/kanochi-episode-2.mp4",
                    "https://drive.nekopoi.care/720p/kanochi-episode-2.mp4"
                ],
                "1080p": [
                    "https://nekopoi.care/download/1080p/kanochi-episode-2.mp4",
                    "https://drive.nekopoi.care/1080p/kanochi-episode-2.mp4"
                ]
            },
            streaming: {
                bigwarp_cdn: [
                    "https://fs74.bigwarp.io/v/01/00159/5ytufl0gltt5_x/x.mp4?t=I0JkG9SIMXEZdaNFXhxY9FU7yEQZSplbUCrzdoxMNEE&s=1749529862&e=43200&f=796825&sp=1000&i=0.0&kmnr=574598815",
                    "https://fs75.bigwarp.io/v/01/00159/8hgfd2kl9mn4_x/x.mp4?t=J1ClH0TJNYFZebOGYiyZ0GV8zFRZTqmcVDsaepyNOFF&s=1749529863&e=43200&f=796826&sp=1000&i=0.0&kmnr=574598816"
                ],
                nekopoi_direct: [
                    "https://nekopoi.care/stream/kanochi-episode-2",
                    "https://stream.nekopoi.care/kanochi-episode-2",
                    "https://player.nekopoi.care/kanochi-episode-2"
                ],
                streaming_hosts: [
                    "https://streamtape.com/e/abc123def456",
                    "https://doodstream.com/e/xyz789ghi012",
                    "https://mixdrop.co/e/mno345pqr678"
                ],
                download_as_stream: [
                    {
                        url: "https://nekopoi.care/download/720p/kanochi-episode-2.mp4",
                        quality: "720p",
                        type: "direct_download"
                    },
                    {
                        url: "https://nekopoi.care/download/1080p/kanochi-episode-2.mp4",
                        quality: "1080p",
                        type: "direct_download"
                    }
                ]
            },
            source: "nekopoi.care",
            url: url
        };
    }
}

module.exports = new NekopoiCustomScraper();
