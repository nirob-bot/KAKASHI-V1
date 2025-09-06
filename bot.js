const fs = require("fs");
const path = require("path");

// Create a fake global object for demonstration
global.GoatBot = { config: { prefix: "!" } };
global.commands = new Map();

// Command Loader
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const fullPath = path.join(commandsPath, file);
    const command = require(fullPath);

    if (!command.config || !command.config.name) continue;
    global.commands.set(command.config.name, command);
    console.log(`✅ Loaded command: ${command.config.name}`);
  } catch (err) {
    console.error(`❌ Failed to load command ${file}:`, err);
  }
}

// Simulate a message
async function simulateMessage(text) {
  const args = text.split(" ");
  const cmdName = args.shift().toLowerCase();

  const command = global.commands.get(cmdName);
  if (!command) return console.log("Command not found!");

  await command.onStart({
    message: {
      reply: async msg => console.log("BOT REPLY:", msg)
    },
    args,
    commands: global.commands
  });
}

// Example usage
simulateMessage("category system"); // Try calling the category command
