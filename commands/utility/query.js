const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} = require('discord.js');

module.exports = {//讓使用者選擇不同之對話風格
	data: new SlashCommandBuilder()
		.setName('roleqa')
		.setDescription('提供不同的回答風格'),
	async execute(interaction) {
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('select')
			.setPlaceholder('請選擇一個風格')
			.addOptions([
				new StringSelectMenuOptionBuilder()
					.setLabel('耐心的老師')
					.setDescription('老師會一步步帶您操作')
					.setValue('option1'),
				new StringSelectMenuOptionBuilder()
					.setLabel('只說重點的老手')
					.setDescription('只講重點，人狠話不多')
					.setValue('option2'),
				new StringSelectMenuOptionBuilder()
					.setLabel('只按照文件回答')  
					.setDescription('忠誠的描述事實') 
					.setValue('option3'),


			]);

		const row = new ActionRowBuilder()
			.addComponents(selectMenu);

		await interaction.reply({
			content: '選擇一個風格',
			components: [row],
			ephemeral : true,
		})
	},
};
