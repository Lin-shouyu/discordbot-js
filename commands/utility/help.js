const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('提供關於機器人功能的幫助信息'),
	async execute(interaction) {
		// 创建一个嵌入消息的实例
		const helpEmbed = new EmbedBuilder()
			.setColor(0x0099ff) // 可以是任何颜色
			.setTitle('機器人幫助指南')
			.setDescription('歡迎使用廠務知識機器人，以下是機器人可以提供的所有功能介绍：')
			.addFields(
				{ name: '/roleqa 指令',
					value: '使用以***規範***的格式，像機器人提出問題，機器人會讀取儲存於雲端的檔案回復您的問題。\n' +
						'機器人有兩種模式可供自由選擇。\n\n' +
						'• **模式**: \n指定查詢模式 \n高手模式:直接找出您的問題可能位於哪個檔案，藉由您自行翻閱檔案, \n\n老師模式:由生成式AI閱讀完文件後告訴您應該如何處理。\n\n' +
						'• **内容**: 您想要查詢的問題\n' +
						'• **示例**: /roleqa 模式 高手模式 内容 "機台名稱xxx 機台未啟動"\n' +
						'機器人會處理您的問題，並返回查詢結果。\n\n' +
						' 以 高手模式 回復 : The result is : xxx\n  The doc source is : xxx.pdf\nThe doc page is : x\n'},
				{   name: '/qa_in_freedom',
					value: '以不受規範的格式向機器人進行詢問。\n\n'+
					'若您的問題無法填入以規範格式中，可以使用這個指令，以自由的格式向機器人進行詢問。\n'},
				{   name: '/upload',
					value: '上傳資料工廠文件。\n'+
				'管理者可除了可以使用web上傳檔案外，也可以使用機器人上傳檔案。\n'},
				{   name: '/download',
					value: '下載資料工廠文件。\n'+
						'讓使用者在經過詢問後可以快速從雲端下載想要閱讀的文件。\n'},
				{   name: '/highrequestion',
					value: '顯示最常被搜尋的熱門問題。\n'+
				'若您有問題不知道該如何下指令查詢也可以優先查看這裡。\n'}

				// 添加更多的字段来描述每个命令
			)
			.setImage('https://th.bing.com/th/id/OIP.vcOCMRHDATaTcVgTEvi6ywHaG9?rs=1&pid=ImgDetMain')
			.setTimestamp()
			.setFooter({ text: '廠務知識機器人幫助指南', iconURL: 'https://th.bing.com/th/id/OIP.dK2HKDqjfr_dm1Mz4iLv0AHaEK?rs=1&pid=ImgDetMain' });

		// 发送嵌入消息
		await interaction.reply({ embeds: [helpEmbed] });
	},
};