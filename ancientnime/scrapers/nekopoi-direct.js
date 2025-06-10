// 🔥 NEKOPOI.CARE DIRECT STREAMING SCRAPER
// Real BigWarp CDN URL extraction with token parsing

const axios = require('axios');
const cheerio = require('cheerio');

class NekopoiDirectStreaming {
    constructor() {
        this.baseUrl = 'https://nekopoi.care';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    // 🎯 GET LATEST EPISODES WITH DIRECT STREAMING LINKS
    async getLatestEpisodes(page = 1) {
        try {
            console.log('🔍 Scraping Nekopoi.care latest episodes...');
            
            const response = await axios.get(`${this.baseUrl}/page/${page}`, {
                headers: this.headers,
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const episodes = [];

            // Parse episode cards
            $('.post-item, .entry-item, article').each((index, element) => {
                const $el = $(element);
                const title = $el.find('h2 a, .entry-title a, .post-title a').text().trim();
                const url = $el.find('h2 a, .entry-title a, .post-title a').attr('href');
                const thumbnail = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
                const description = $el.find('.entry-summary, .post-excerpt').text().trim();

                if (title && url) {
                    episodes.push({
                        title: title,
                        url: url,
                        thumbnail: thumbnail,
                        description: description,
                        id: this.extractEpisodeId(url)
                    });
                }
            });

            console.log(`✅ Found ${episodes.length} episodes`);
            return episodes;

        } catch (error) {
            console.error('❌ Error scraping latest episodes:', error.message);
            return [];
        }
    }

    // 🎯 GET DIRECT STREAMING LINKS FROM EPISODE PAGE
    async getDirectStreamingLinks(episodeUrl) {
        try {
            console.log('🔍 Extracting direct streaming links from:', episodeUrl);
            
            const response = await axios.get(episodeUrl, {
                headers: this.headers,
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            const streamingData = {
                title: $('h1, .entry-title').first().text().trim(),
                bigwarp_cdn: [],
                nekopoi_direct: [],
                streaming_hosts: [],
                download_links: []
            };

            // 🔥 EXTRACT BIGWARP CDN LINKS (PRIORITY!)
            const bigwarpLinks = this.extractBigWarpLinks(response.data);
            streamingData.bigwarp_cdn = bigwarpLinks;

            // 🎬 EXTRACT STREAMING HOST LINKS
            const hostLinks = this.extractStreamingHosts($);
            streamingData.streaming_hosts = hostLinks;

            // 💾 EXTRACT DOWNLOAD LINKS (CAN BE USED AS STREAMING)
            const downloadLinks = this.extractDownloadLinks($);
            streamingData.download_links = downloadLinks;

            // 🔗 EXTRACT NEKOPOI DIRECT LINKS
            const directLinks = this.extractNekopoiDirectLinks($);
            streamingData.nekopoi_direct = directLinks;

            console.log('✅ Extracted streaming data:', {
                bigwarp_count: streamingData.bigwarp_cdn.length,
                hosts_count: streamingData.streaming_hosts.length,
                downloads_count: streamingData.download_links.length,
                direct_count: streamingData.nekopoi_direct.length
            });

            return streamingData;

        } catch (error) {
            console.error('❌ Error extracting streaming links:', error.message);
            return null;
        }
    }

    // 🔥 EXTRACT BIGWARP CDN URLS WITH TOKEN PARSING
    extractBigWarpLinks(htmlContent) {
        const bigwarpLinks = [];
        
        try {
            // Look for BigWarp URLs in various formats
            const bigwarpPatterns = [
                /https?:\/\/bigwarp\.io\/[^"'\s]+/gi,
                /https?:\/\/[^"'\s]*bigwarp[^"'\s]*/gi,
                /https?:\/\/[^"'\s]*\.bigwarp\.io[^"'\s]*/gi
            ];

            bigwarpPatterns.forEach(pattern => {
                const matches = htmlContent.match(pattern);
                if (matches) {
                    matches.forEach(url => {
                        // Parse BigWarp URL parameters
                        const parsedUrl = this.parseBigWarpUrl(url);
                        if (parsedUrl && !bigwarpLinks.some(link => link.url === parsedUrl.url)) {
                            bigwarpLinks.push(parsedUrl);
                        }
                    });
                }
            });

            // Also look for encoded/obfuscated BigWarp links
            const encodedMatches = htmlContent.match(/atob\(['"]([^'"]+)['"]\)/gi);
            if (encodedMatches) {
                encodedMatches.forEach(match => {
                    try {
                        const base64 = match.match(/atob\(['"]([^'"]+)['"]\)/)[1];
                        const decoded = Buffer.from(base64, 'base64').toString();
                        if (decoded.includes('bigwarp')) {
                            const parsedUrl = this.parseBigWarpUrl(decoded);
                            if (parsedUrl && !bigwarpLinks.some(link => link.url === parsedUrl.url)) {
                                bigwarpLinks.push(parsedUrl);
                            }
                        }
                    } catch (e) {
                        // Ignore decode errors
                    }
                });
            }

        } catch (error) {
            console.error('Error extracting BigWarp links:', error.message);
        }

        return bigwarpLinks;
    }

    // 🎯 PARSE BIGWARP URL WITH PARAMETERS
    parseBigWarpUrl(url) {
        try {
            const urlObj = new URL(url);
            const params = {};
            
            // Extract all parameters
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });

            return {
                url: url,
                base_url: `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`,
                parameters: params,
                token: params.t || null,
                signature: params.s || null,
                expire: params.e || null,
                format: params.f || null,
                speed: params.sp || null,
                id: params.i || null,
                key: params.kmnr || null,
                quality: this.detectQuality(url),
                is_valid: this.validateBigWarpUrl(params)
            };
        } catch (error) {
            console.error('Error parsing BigWarp URL:', error.message);
            return null;
        }
    }

    // 🔍 VALIDATE BIGWARP URL PARAMETERS
    validateBigWarpUrl(params) {
        // Check if required parameters exist
        const requiredParams = ['t', 's', 'e'];
        return requiredParams.some(param => params[param]);
    }

    // 🎬 DETECT VIDEO QUALITY FROM URL
    detectQuality(url) {
        const qualityPatterns = {
            '4k': /4k|2160p|uhd/i,
            '1080p': /1080p|fhd|fullhd/i,
            '720p': /720p|hd/i,
            '480p': /480p|sd/i,
            '360p': /360p|mobile/i
        };

        for (const [quality, pattern] of Object.entries(qualityPatterns)) {
            if (pattern.test(url)) {
                return quality;
            }
        }

        return 'unknown';
    }

    // 🎭 EXTRACT STREAMING HOST LINKS
    extractStreamingHosts($) {
        const hostLinks = [];
        const hostPatterns = [
            'streamtape.com',
            'doodstream.com',
            'mixdrop.co',
            'fembed.com',
            'streamsb.net'
        ];

        $('a[href*="stream"], iframe[src*="stream"]').each((index, element) => {
            const url = $(element).attr('href') || $(element).attr('src');
            if (url) {
                hostPatterns.forEach(host => {
                    if (url.includes(host)) {
                        hostLinks.push({
                            url: url,
                            host: host,
                            type: 'streaming_host'
                        });
                    }
                });
            }
        });

        return hostLinks;
    }

    // 💾 EXTRACT DOWNLOAD LINKS (CAN BE STREAMED)
    extractDownloadLinks($) {
        const downloadLinks = [];
        
        $('a[href*=".mp4"], a[href*=".mkv"], a[href*="download"]').each((index, element) => {
            const url = $(element).attr('href');
            const text = $(element).text().trim();
            
            if (url && (url.includes('.mp4') || url.includes('.mkv'))) {
                downloadLinks.push({
                    url: url,
                    quality: this.detectQuality(text + ' ' + url),
                    type: 'download_as_stream',
                    label: text
                });
            }
        });

        return downloadLinks;
    }

    // 🔗 EXTRACT NEKOPOI DIRECT LINKS
    extractNekopoiDirectLinks($) {
        const directLinks = [];
        
        $('a[href*="nekopoi"], iframe[src*="nekopoi"]').each((index, element) => {
            const url = $(element).attr('href') || $(element).attr('src');
            if (url && !url.includes('/embed/')) {
                directLinks.push({
                    url: url,
                    type: 'nekopoi_direct'
                });
            }
        });

        return directLinks;
    }

    // 🎯 EXTRACT EPISODE ID FROM URL
    extractEpisodeId(url) {
        const matches = url.match(/\/([^\/]+)\/?$/);
        return matches ? matches[1] : null;
    }

    // 🔥 GET EPISODE DETAIL WITH ALL STREAMING DATA
    async getEpisodeDetail(episodeId) {
        try {
            const episodeUrl = `${this.baseUrl}/${episodeId}`;
            const streamingData = await this.getDirectStreamingLinks(episodeUrl);
            
            if (streamingData) {
                return {
                    status: 'success',
                    episode_id: episodeId,
                    episode_url: episodeUrl,
                    ...streamingData
                };
            } else {
                throw new Error('Failed to extract streaming data');
            }
        } catch (error) {
            console.error('❌ Error getting episode detail:', error.message);
            return {
                status: 'error',
                message: error.message,
                episode_id: episodeId
            };
        }
    }
}

module.exports = NekopoiDirectStreaming;
