const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("QR Code එක Scan කරන්න:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('සම්බන්ධතාවය බිඳුණා. නැවත සම්බන්ධ වෙනවා...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp Bot සාර්ථකව සම්බන්ධ වුණා!');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const sender = msg.key.remoteJid;

        // සින්දු (Audio) ඩවුන්ලෝඩ් කිරීමට: .song <සින්දුවේ නම>
        if (text.startsWith('.song')) {
            const query = text.replace('.song', '').trim();
            if (!query) return sock.sendMessage(sender, { text: 'කරුණාකර සින්දුවේ නම ඇතුළත් කරන්න.' });

            await sock.sendMessage(sender, { text: '🔍 සින්දුව සොයමින් පවතී...' });

            try {
                const search = await yts(query);
                const video = search.videos[0];
                if (!video) return sock.sendMessage(sender, { text: 'සින්දුව හමු වුණේ නැත.' });

                await sock.sendMessage(sender, { text: `🎶 *${video.title}* ඩවුන්ලෝඩ් වෙමින් පවතී...` });

                const stream = ytdl(video.url, { filter: 'audioonly' });
                const filePath = `./${Date.now()}.mp3`;
                const fileStream = fs.createWriteStream(filePath);

                stream.pipe(fileStream);

                fileStream.on('finish', async () => {
                    await sock.sendMessage(sender, { 
                        audio: fs.readFileSync(filePath), 
                        mimetype: 'audio/mp4',
                        fileName: `${video.title}.mp3`
                    });
                    fs.unlinkSync(filePath);
                });
            } catch (err) {
                console.error(err);
                await sock.sendMessage(sender, { text: 'සින්දුව ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක් සිදු වුණා.' });
            }
        }

        // වීඩියෝ (Video) ඩවුන්ලෝඩ් කිරීමට: .video <වීඩියෝ එකේ නම>
        if (text.startsWith('.video')) {
            const query = text.replace('.video', '').trim();
            if (!query) return sock.sendMessage(sender, { text: 'කරුණාකර වීඩියෝ එකේ නම ඇතුළත් කරන්න.' });

            await sock.sendMessage(sender, { text: '🔍 වීඩියෝ එක සොයමින් පවතී...' });

            try {
                const search = await yts(query);
                const video = search.videos[0];
                if (!video) return sock.sendMessage(sender, { text: 'වීඩියෝ එක හමු වුණේ නැත.' });

                await sock.sendMessage(sender, { text: `🎬 *${video.title}* වීඩියෝ එක ඩවුන්ලෝඩ් වෙමින් පවතී...` });

                const stream = ytdl(video.url, { filter: 'videoandaudio', quality: 'lowestvideo' });
                const filePath = `./${Date.now()}.mp4`;
                const fileStream = fs.createWriteStream(filePath);

                stream.pipe(fileStream);

                fileStream.on('finish', async () => {
                    await sock.sendMessage(sender, { 
                        video: fs.readFileSync(filePath), 
                        caption: video.title,
                        mimetype: 'video/mp4'
                    });
                    fs.unlinkSync(filePath);
                });
            } catch (err) {
                console.error(err);
                await sock.sendMessage(sender, { text: 'වීඩියෝ එක ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක් සිදු වුණා.' });
            }
        }
    });
}

connectToWhatsApp();
