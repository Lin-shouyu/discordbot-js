const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
async function showModal(interaction) {
	const modal = new ModalBuilder()
		.setCustomId('myModal')
		.setTitle('請輸入您欲查詢的問題');

	const favoriteColorInput = new TextInputBuilder()
		.setCustomId('prompt1')
		.setLabel("請輸入機台名稱")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);
	const hobbiesInput = new TextInputBuilder()
		.setCustomId('prompt2')
		.setLabel("請輸入機台狀況")
		.setStyle(TextInputStyle.Paragraph);
	const docinput = new TextInputBuilder()
		.setCustomId('prompt3')
		.setLabel("請輸入文件名稱")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);
	const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
	const thirdActionRow = new ActionRowBuilder().addComponents(docinput);
	const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

	modal.addComponents(firstActionRow, thirdActionRow,secondActionRow);
	await interaction.showModal(modal);
}

module.exports = { showModal };
