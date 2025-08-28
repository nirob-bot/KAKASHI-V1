const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

const helpImages = [
  "https://files.catbox.moe/wseew7.jpg",
  "https://files.catbox.moe/tywnfi.jpg",
  "https://files.catbox.moe/tse9uk.jpg",
  "https://files.catbox.moe/l8d5af.jpg",
  "https://files.catbox.moe/hgmwuw.jpg",
  "https://files.catbox.moe/gu6m57.jpg",
  "https://files.catbox.moe/t366ko.jpg",
  "https://files.catbox.moe/pto5xi.jpg",
  "https://files.catbox.moe/td2723.jpg",
  "https://files.catbox.moe/y5kplz.jpg"
];

// Random image
function getRandomImage() {
  return helpImages[Math.floor(Math.random() * helpImages.length)];
}

// Category builder
function buildCategory(catName, commands, prefix) {
  const cmdList = commands.map(c => `${prefix}${c}`).join("   ");
  return `───────────────\n📂 ${catName}\n${cmdList}\n───────────────\n`;
}

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "ＮＩＲＯＢ",
    role: 0,
    shortDescription: { en: "Help menu with 🖤 pagination" },
    longDescription: { en: "Shows commands by category with images. React 🖤 to move pages." },
    category: "info",
    guide: { en: "{pn} [1-10]" },
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID) || global.GoatBot.config.prefix || "!";
    let page = 1;

    if (args.length > 0) {
      const p = parseInt(args[0]);
      if (!isNaN(p) && p >= 1 && p <= 10) page = p;
    }

    // Filter commands by role
    const availableCommands = [];
    for (const [name, cmd] of commands) {
      if (cmd.config.role > role) continue;
      availableCommands.push(cmd);
    }

    // Group commands by category
    const categories = {};
    for (const cmd of availableCommands) {
      const cat = cmd.config.category || "Other";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    const allCategories = Object.keys(categories);
    const totalPages = 10;
    const perPage = Math.ceil(allCategories.length / totalPages);

    // Function to send a page
    async function sendPage(p, oldMessageID = null) {
      const startIndex = (p - 1) * perPage;
      const endIndex = startIndex + perPage;
      const pageCategories = allCategories.slice(startIndex, endIndex);

      let msg = `🐾 Kakashi Help Menu 🐾\nPage ${p}/${totalPages}\n────────────────────────────\n`;
      for (const cat of pageCategories) {
        msg += buildCategory(cat, categories[cat], prefix);
      }
      msg += `────────────────────────────\nDev: Nirob | Nick: Kakashi\nFB: https://facebook.com/hatake.kakashi.NN\nReact 🖤 to go next page.\n────────────────────────────`;

      const sentMsg = await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(getRandomImage())
      });

      // Remove old help message for clean pagination
      if (oldMessageID) {
        try { await global.GoatBot.api.unsendMessage(oldMessageID); } catch (e) {}
      }

      // Save reaction listener
      global.GoatBot.onReaction.set(sentMsg.messageID, {
        messageObj: message,
        onReact: async (eventReact) => {
          if (eventReact.reaction !== '🖤') return;

          let nextPage = p + 1;
          if (nextPage > totalPages) nextPage = 1;

          // এখানে fix করা হলো (sentMsg.messageID পাঠাচ্ছি)
          await sendPage(nextPage, sentMsg.messageID);
        }
      });
    }

    await sendPage(page);
  }
};
