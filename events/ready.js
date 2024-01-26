const { Events } = require('discord.js');

module.exports = {
	//bot開始運作提示
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};