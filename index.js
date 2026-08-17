const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

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

    // මැසේජ් පරීක්ෂා කිරීම සහ සින්දු ඩවුන්ලෝඩ් Command එක
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const sender = msg.key.remoteJid;

        if (text.startsWith('.song')) {
            await sock.sendMessage(sender, { text: 'සින්දුව සෙවීම ආරම්භ කළා...' });
            // මෙතැනට ytdl-core භාවිතයෙන් සින්දුව ඩවුන්ලෝඩ් කර යවන කෝඩ් එක එකතු කළ හැක
        }
    });
}

connectToWhatsApp();
