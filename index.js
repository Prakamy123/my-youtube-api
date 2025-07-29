const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('YouTube Downloader API is running!');
});

app.post('/getVideoInfo', async (req, res) => {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ success: false, message: 'कृपया एक मान्य यूट्यूब URL प्रदान करें।' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        
        // वीडियो और ऑडियो वाले फॉर्मेट्स को फ़िल्टर करें
        let formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        
        const availableFormats = formats
            .filter(format => format.qualityLabel && format.container)
            .map(format => ({
                quality: format.qualityLabel,
                container: format.container,
                url: format.url,
            }));
        
        // MP3 (सिर्फ ऑडियो) के लिए लिंक निकालें
        const audioFormat = ytdl.filterFormats(info.formats, 'audioonly').find(f => f.mimeType.includes('mp4'));
        if (audioFormat) {
            availableFormats.push({
                quality: 'MP3 (128kbps)',
                container: 'mp3',
                url: audioFormat.url,
            });
        }
        
        res.json({
            success: true,
            title,
            thumbnail,
            formats: availableFormats,
        });

    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ success: false, message: 'वीडियो की जानकारी प्राप्त करने में विफल।' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
