const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state })
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (u) => {
    const { connection, lastDisconnect, qr } = u
    if(qr) {
      console.log("\nScan QR hii na WhatsApp yako:")
      qrcode.generate(qr, { small: true })
    }
    if(connection === 'close') {
      if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) start()
    } else if(connection === 'open') {
      console.log('✅ SIMPLE BOT IKO LIVE! Jaribu kutumiwa "mambo"')
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if(!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase()
    const name = msg.pushName || "Mkuu"

    // JIBU KAMA BINADAMU
    if(text.includes("mambo") || text.includes("hujambo")) {
      await sock.sendMessage(from, { text: `Poa ${name}! 😊 Mambo vipi? Karibu sana. Unahitaji msaada gani leo?` })
    }
    else if(text.includes("bei") || text.includes("gharama")) {
      await sock.sendMessage(from, { text: `Bei zetu ni nafuu sana ${name}!\n\nKwa maelezo zaidi andika *huduma*` })
    }
    else if(text.includes("huduma") || text.includes("services")) {
      await sock.sendMessage(from, { text: `🤖 *HUDUMA ZETU*\n\n1. Tunajibu wateja 24/7\n2. Tunatunza group lako\n3. Tunapakua TikTok/IG\n\nAndika *bei* kujua gharama.` })
    }
    else if(text.includes("asante") || text.includes("sawa")) {
      await sock.sendMessage(from, { text: `Karibu sana ${name} 🙏 Niko hapa muda wote ukihitaji msaada.` })
    }
    else if(text.includes("uko wapi") || text.includes("location")) {
      await sock.sendMessage(from, { text: `Tupo Mwanza - Rock City Mall, lakini tunahudumia Tanzania nzima online! 🌍` })
    }
    else {
      // Kama hajui cha kujibu, anajibu kiofisi
      await sock.sendMessage(from, { text: `Sasa ${name}, nimepokea ujumbe wako: "${text}"\n\nNiko hapa kukusaidia! Andika *huduma* kuona tunachofanya, au *bei* kujua gharama.` })
    }
  })
}

start()