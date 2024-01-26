const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('highfrequestion')
		.setDescription('列出一些常見問題'),
	async execute(interaction) {
		const helpEmbed = new EmbedBuilder()
			.setColor(0x0099ff) // 可以是任何颜色
			.setTitle('常見問題一覽表')
			.setDescription('歡迎使用廠務知識機器人，以下是機器人可以提供的所有功能介绍：')
			.addFields(
				{ name: '前三名最常被查詢問題',
					value: '**問題一**:\n異常狀況：x100 機台未啟動  \n解決方法: 1. 檢查電源連接是否正確。\n' +
						'2. 確認緊急停止按鈕是否處於正常位置。\n' +
						'3. 檢查控制系統面板，確認是否有任何報警信息。\n\n' +
						'• **問題二**: \n異常狀況：x100加工精度不佳\n1. 檢查刀具是否磨損，如有磨損應及時更換。\n' +
						'2. 確認冷卻液流量是否正常，過低的流量可能導致切削效果不佳。\n' +
						'3. 檢查伺服馬達是否正常運作，如有異常應及時聯繫維修人員。\n' +
						'• **問題三**: \n異常狀況： x100 刀具換裝失敗\n解決方法：\n' +
						'1. 檢查刀具庫是否卡住，如卡住應清理刀具庫。\n' +
						'2. 確認刀具是否正確放置在刀具庫中。\n' +
						'3. 檢查刀具庫換裝系統的氣源壓力，過低的氣壓可能導致換裝失敗。'
						}
			)
			.setImage('https://imgs.cwgv.com.tw/hbr_articles/19/18219/preview/18219.png')
			.setTimestamp()
			.setFooter({ text: '廠務知識機器人幫助指南', iconURL: 'https://th.bing.com/th/id/OIP.dK2HKDqjfr_dm1Mz4iLv0AHaEK?rs=1&pid=ImgDetMain' });

		// 发送嵌入消息
		await interaction.reply({ embeds: [helpEmbed] });
	},
};