const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { flask_url_Down } = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('download')
		.setDescription('下載資料')
		.addStringOption(option =>
			option.setName('filename')
				.setDescription('The name of the file to download')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('department')
				.setDescription('The department name')
				.setRequired(true)), // 添加部門選項,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true});
		const filename = interaction.options.getString('filename');
		const member = interaction.member;
		const nickname = member.nickname || member.user.username;
		const department = interaction.options.getString('department');
		const roles = member.roles.cache
			.filter(role => role.name !== '@everyone')
			.map(role => role.name)
			.join(', ');

		try {
			const response = await axios.post(flask_url_Down, {
				DocName: filename,
				DepName: department,
			});
			const fileUrl = response.data;
			console.log('成功發送資料到 Flask API:', fileUrl);
			await interaction.editReply(`檔案: [${filename}](${fileUrl})`);
		} catch (error) {
			console.error('Error:', error.message);
			if (!interaction.replied && !interaction.deferred) {
				await interaction.editReply({ content: 'Error processing request.', ephemeral: true });
			} else {
				await interaction.editReply({ content: 'Error processing request.', ephemeral: true });
			}
		}
	},
};