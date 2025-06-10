const NekopoiScrapper = require('./NekopoiScrapper');

console.log('🚀 Starting Nekopoi Scrapper...\n');

// Latest Release
console.log('📋 Fetching latest releases...');
NekopoiScrapper.getLatest()
    .then(result => {
        console.log('✅ Latest releases fetched successfully!');
        console.log(result);
        console.log('\n' + '='.repeat(50) + '\n');

        // Get Page Info
        console.log('📄 Fetching page info...');
        return NekopoiScrapper.getInfo("https://nekopoi.care/sexfriend-gakuen-episode-1-subtitle-indonesia/");
    })
    .then(result => {
        console.log('✅ Page info fetched successfully!');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
