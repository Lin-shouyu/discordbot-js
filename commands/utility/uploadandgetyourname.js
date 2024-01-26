const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { flask_url } = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('upload')
		.setDescription('上傳資料')
		.addAttachmentOption(option =>
			option.setName('file')
				.setDescription('The file to upload')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true});
		const file = interaction.options.getAttachment('file');
		const member = interaction.member;
		const nickname = member.nickname || member.user.username;
		const filename = file.name;
		const IT = "IT";
		const roles = member.roles.cache
			.filter(role => role.name !== '@everyone')
			.map(role => role.name)
			.join(', ');

		// 發送 POST 請求到 Flask API
		try {
			const response = await axios.post(flask_url, {
				DocName: filename,  // 或其他適當的值
				FilePath: file.url,
				UserName: nickname,
				DepName: IT,
			});

			console.log('成功發送資料到 Flask API:', file.url);
			await interaction.editReply(`File uploaded successfully!\nYour username: ${nickname}\nYour roles: ${roles}\nFilename: ${filename}`);
		} catch (error) {
			console.error('發送 POST 請求時出錯:', error.message);
			await interaction.editReply('Error uploading file.');
		}
	},
};