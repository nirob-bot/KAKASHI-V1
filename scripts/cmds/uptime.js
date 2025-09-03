const os = require('os');
const { bold } = require("fontstyles");

module.exports = {
  config: {
    name: 'uptime',
    aliases: ['upt', 'u', 'up', 'rtm'],
    version: '1.9',
    author: 'Mahi | Redwan',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot uptime and system stats with media ban check',
    category: 'system'
  },

  onStart: async function ({ message, event, usersData, threadsData, api }) {
    try {
      const startTime = Date.now();

      // ✅ Safe fetching
      let users = [];
      let groups = [];
      let mediaBan = false;

      try { users = await usersData.getAll(); } catch(e) { users = []; console.error("usersData.getAll error:", e); }
      try { groups = await threadsData.getAll(); } catch(e) { groups = []; console.error("threadsData.getAll error:", e); }
      try { 
        if(event && event.threadID) mediaBan = await threadsData.get(event.threadID, 'mediaBan'); 
      } catch(e) { mediaBan = false; console.error("threadsData.get error:", e); }

      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const usedMemoryGB = (usedMemory / 1024 / 1024 / 1024).toFixed(2);
      const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);
      const freeMemoryGB = (freeMemory / 1024 / 1024 / 1024).toFixed(2);
      const memoryUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

      const cpuCores = os.cpus() ? os.cpus().length : 0;
      const cpuModel = os.cpus() ? os.cpus()[0].model : "Unknown";
      const nodeVersion = process.version;
      const platform = os.platform();

      const endTime = Date.now();
      const botPing = endTime - startTime;
      const totalMessages = users.reduce((sum, user) => sum + (user.messageCount || 0), 0);

      const bangladeshTime = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });

      const mediaBanStatus = mediaBan ? '🚫 Media is currently banned in this chat.' : '✅ Media is not banned in this chat.';

      // 🌀 Loading Frames
      const loadingFrames = [
        "LOADING.\n[██░░░░░░░]",
        "LOADING..\n[████░░░░░]",
        "LOADING...\n[██████░░░]",
        "LOADING...\n[████████░]",
        "LOADED...\n[██████████]"
      ];

      // Ensure api.editMessage exists
      if(!api || !api.editMessage) {
        console.log("api.editMessage not found");
        return message.reply("❌ API error: editMessage not found");
      }

      // Initial loading message
      let sent = await message.reply(loadingFrames[0]);

      // Animate loading frames
      for (let i = 1; i < loadingFrames.length; i++) {
        await new Promise(res => setTimeout(res, 700));
        api.editMessage(loadingFrames[i], sent.messageID);
      }

      // 🖥 Final system stats message
      const finalMsg = 
`🖥 ${bold("System Statistics")}
• Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
• Memory Usage: ${usedMemoryGB} GB / ${totalMemoryGB} GB (${memoryUsagePercentage}%)
• Free Memory: ${freeMemoryGB} GB
• CPU Cores: ${cpuCores}
• CPU Model: ${cpuModel}
• Node.js: ${nodeVersion}
• Platform: ${platform}
• Ping: ${botPing}ms
• Total Users: ${users.length}
• Total Groups: ${groups.length}
• Messages Processed: ${totalMessages}
${mediaBanStatus}

📅 ${bold("Current Date & Time")}
• ${bangladeshTime}`;

      // Small delay before showing final stats
      setTimeout(() => api.editMessage(finalMsg, sent.messageID), 800);

    } catch (err) {
      console.error("Unexpected error:", err);
      return message.reply("❌ Error fetching system stats.");
    }
  }
};
