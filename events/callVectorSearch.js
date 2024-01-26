const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { flask_url2 } = require('../config.json');

async function executePythonScript(interaction, content, selectedValue,components) {
	await interaction.deferReply({ ephemeral: true });

	try {
		const response = await axios.post(flask_url2+"/query_in_role_qa", { //送至flask
			question: content,  
			 selectedValue: selectedValue,    //option1 or option2
		});
		console.log('成功發送資料到 Flask API:', response.data['source'] , response.data['page']); 
		const ans = `您選擇的對話風格: ${selectedValue} \nThe result is : ${response.data['result']}  \n
			The doc source is : ${response.data['source']}
			The doc page is : ${response.data['page']}`
		await interaction.editReply( {content :ans ,components: components});//回復使用者
		return ans
	} catch (error) { //若flask出錯時debug
		console.error('發送 POST 請求時出錯:', error.message);
		await interaction.editReply('Error uploading file.');
	}
}

module.exports = { executePythonScript };
