const osu = require("node-os-utils");

// Bot start time
if (!global.botStartTime) global.botStartTime = Date.now();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.1",
    author: "VEX_ADNAN",
    role: 0,
    category: "System",
  },

  onStart: async function ({ api, event }) {
    try {
      // ⏱ Uptime calculation
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
      const imageUrl = "https://files.catbox.moe/7jqv64.jpg";

      // First send "pinging..." to measure latency
      const sentTime = Date.now();
      api.sendMessage("⏳ Calculating ping...", event.threadID, async (err, info) => {
        if (err) return;

        const ping = Date.now() - sentTime; // Real latency

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

        const msg = {
          body: msgBody,
          attachment: await global.utils.getStreamFromURL(imageUrl)
        };

        // Edit the first message with final result
        api.editMessage(msg.body, info.messageID, () => {
          api.sendMessage({ attachment: msg.attachment }, event.threadID);
        });
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Oops! Something went wrong while fetching kawaii system info.", event.threadID);
    }
  }
};
