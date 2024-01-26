const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { flask_url2 } = require('../../config.json');
const { createButtonRow } = require('../../events/buttonCreate.js'); // 確保路徑正確
module.exports = {
	data: new SlashCommandBuilder()
		.setName('qa_in_freedom')
		.setDescription('以自由格式向機器人進行詢問')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The question you want to ask')
				.setRequired(true)), // Make sure the input is required
	async execute(interaction) {
		// Retrieve the string input from the user
		await interaction.deferReply({ ephemeral: true});
		const userInput = interaction.options.getString('input');
		const row = createButtonRow();
		// You can now use this string to perform your query with flask
		try {
			const response = await axios.post(flask_url2+"/query", {
				question: userInput,  // 或其他適當的值
			});

			console.log('成功發送資料到 Flask API:', response.data['source'] , response.data['page']);
			await interaction.editReply( {content :`The result is : ${response.data['result']}  \n
			The doc source is : ${response.data['source']}
			The doc page is : ${response.data['page']}` ,
				components: [row]});

		} catch (error) {
			console.error('發送 POST 請求時出錯:', error.message);
			await interaction.editReply('Error uploading file.');
		}
	},
};