onReply: async function({ api, event, Reply, getLang, threadsData }) {
  if (String(event.senderID) !== String(Reply.author)) return;
  const { body, threadID, messageID } = event;
  var count = 0;

  // Cancel system
  if ((isNaN(body) && body.indexOf("c") == 0) || body.indexOf("cancel") == 0) {
    const index = (body.slice(1, body.length)).split(/\s+/);
    for (const ArYanIndex of index) {
      if (isNaN(ArYanIndex) || ArYanIndex <= 0 || ArYanIndex > Reply.pending.length)
        return api.sendMessage(getLang("invaildNumber", ArYanIndex), threadID, messageID);
      api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[ArYanIndex - 1].threadID);
      count++;
    }
    return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
  }

  // Approve system
  else {
    const index = body.split(/\s+/);
    for (const ArYanIndex of index) {
      if (isNaN(ArYanIndex) || ArYanIndex <= 0 || ArYanIndex > Reply.pending.length)
        return api.sendMessage(getLang("invaildNumber", ArYanIndex), threadID, messageID);

      // ✅ Fetch group prefix dynamically
      const threadIDTarget = Reply.pending[ArYanIndex - 1].threadID;
      const dataThread = await threadsData.get(threadIDTarget);
      const groupPrefix = dataThread?.data?.prefix || "."; // default "."

      api.sendMessage(
`♦⪼  🎀 𝑪𝒐𝒏𝒏𝒆𝒄𝒕𝒆𝒅 🎀 ⪻♦

╭───────────────✦
│ ✨ Global Prefix: .
│ ✨ Group Prefix : ${groupPrefix}
╰───────────────✦

╭───────────────✦
│ 💫 𝑩𝒐𝒕 𝑶𝒘𝒏𝒆𝒓: ニロブ (NIROB)
│ 🌐 FB: https://www.facebook.com/hatake.kakashi.NN
╰───────────────✦

🌸 Welcome to Kakashi Bot 🌸
`, threadIDTarget);

      count++;
    }
    return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
  }
                           }
