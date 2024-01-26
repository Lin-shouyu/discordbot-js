const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createButtonRow() {
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('useful')
				.setLabel('很滿意這次的對話')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('continue')
				.setLabel('結束對話')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('useless')
				.setLabel('不滿意這次的對話')
				.setStyle(ButtonStyle.Danger),
		);
	return row;
}

module.exports = { createButtonRow };
