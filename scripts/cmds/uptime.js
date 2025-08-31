const osu = require("node-os-utils");

// Bot start time
if (!global.botStartTime) global.botStartTime = Date.now();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.5",
    author: "VEX_ADNAN",
    role: 0,
    category: "System",
  },

  onStart: async function ({ api, event }) {
    try {
      // প্রথমে latency মাপার জন্য মেসেজ পাঠানো
      const start = Date.now();
      api.sendMessage("⚡ Checking Kakashi Bot Uptime...", event.threadID, async (err, info) => {
        if (err) return;

        const ping = Date.now() - start; // আসল latency

        // Uptime calculation
        const uptimeMs = Date.now() - global.botStartTime;
        const totalSeconds = Math.floor(uptimeMs / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const days = Math.floor(totalSeconds / 86400);
        const uptimeStr = `𝙳ays: ${days} | 𝙷ours: ${hours} | 𝙼inutes: ${minutes} | 𝚂econds: ${seconds}`;

        // CPU & RAM usage
        const cpuUsage = await osu.cpu.usage();
        const memInfo = await osu.mem.info();
        const ramUsage = memInfo.usedMemMb.toFixed(2);
        const ramTotal = memInfo.totalMemMb.toFixed(2);

        // Groups & Users
        const threads = await api.getThreadList(100, null, ["INBOX"]);
        const groupCount = threads.filter(t => t.isGroup).length;
        const userCount = threads.reduce((acc, t) => acc + (t.participantIDs?.length || 0), 0);

        // Cute image
        const imageUrl = "https://files.catbox.moe/sxwdlb.jpeg";

        // Final message body
        const msgBody = `
╔══════•❀•══════╗
   🐾 𝙺𝙰𝙺𝙰𝚂𝙷𝙸 𝙱𝙾𝚃 🐾
╚══════•❀•══════╝

🌸 𝚄ptime : ⏳ ${uptimeStr}
🌸 𝙶roups : 💞 ${groupCount}
🌸 𝚄sers  : 👥 ${userCount}
🌸 𝙿ing   : ⚡ ${ping}ms
🌸 𝙲PU    : 💻 ${cpuUsage.toFixed(1)}%
🌸 𝚁AM    : 🧠 ${ramUsage}/${ramTotal}MB

╔═══════• 💖 •═══════╗
   🐰 𝚂tay cute & sparkly! 🐰
╚═══════• 💖 •═══════╝
`;

        // পুরনো মেসেজ unsend করে নতুন পাঠানো
        try { await api.unsendMessage(info.messageID); } catch (e) {}

        api.sendMessage(
          {
            body: msgBody,
            attachment: await global.utils.getStreamFromURL(imageUrl)
          },
          event.threadID
        );
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Oops! Something went wrong while fetching kawaii system info.", event.threadID);
    }
  }
};
