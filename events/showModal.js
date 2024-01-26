const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
async function showModal(interaction) {
	//建立一個供使用者查詢之填寫框
	const modal = new ModalBuilder()
		.setCustomId('myModal')
		.setTitle('請輸入您欲查詢的問題');

	const machinenumberinput = new TextInputBuilder()
		.setCustomId('prompt1')
		.setLabel("請輸入機台名稱")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);
	const questuioninput = new TextInputBuilder()
		.setCustomId('prompt2')
		.setLabel("請輸入機台狀況")
		.setStyle(TextInputStyle.Paragraph);
	const docinput = new TextInputBuilder()
		.setCustomId('prompt3')
		.setLabel("請輸入文件名稱")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);
	const firstActionRow = new ActionRowBuilder().addComponents(machinenumberinput);
	const thirdActionRow = new ActionRowBuilder().addComponents(docinput);
	const secondActionRow = new ActionRowBuilder().addComponents(questuioninput);

	modal.addComponents(firstActionRow, thirdActionRow,secondActionRow);
	await interaction.showModal(modal);
}

module.exports = { showModal };
