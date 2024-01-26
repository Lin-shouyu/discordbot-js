const {
	Events,
	ModalBuilder,
	ButtonBuilder,
	ButtonStyle,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require('discord.js');
const selectMenuOptions = require('../commands/utility/selectmenui/seleMenuOp.js'); // 更新這裡的路徑
const { showModal } = require('./showModal');
const { createButtonRow } = require('./buttonCreate.js'); // 確保路徑正確
const { executePythonScript } = require('./callVectorSearch.js'); // 確保路徑正確
const fs = require('fs').promises;
const { textSave } = require('./textSave.js');
let botReply = '';
let modalContent = '';
let userSelections = '';
module.exports = {
	name: Events.InteractionCreate,//處理各個事件
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {//若找不到使用命令
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
				else {
					await interaction.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			}
		}
		else if (interaction.isModalSubmit()) {//當接收到使用者提交modal
			if (interaction.customId === 'myModal') {
				const selectedValue = userSelections; 
				const prompt1 = interaction.fields.getTextInputValue('prompt1');
				const prompt2 = interaction.fields.getTextInputValue('prompt2');
				modalContent = `${prompt1},${prompt2}`;
				const content = `${prompt1}, ${prompt2}`;
				const row = createButtonRow();
				botReply = await executePythonScript(interaction, content, selectedValue, [row]);//將modal內容傳給api得到回覆
			}
		}
		else if (interaction.isStringSelectMenu()) {
			// 處理下拉選單 使用者選擇風格
			if (interaction.customId === 'select') {
				const selectedValue = interaction.values[0];
				const selectedOption = selectMenuOptions.find(option => option.value === selectedValue);//處理使用者選擇了哪個風格按鈕
				const selectedLabel = selectedOption ? selectedOption.label : '未知選項';
				const member = interaction.member;
				const nickname = member.nickname || member.user.username;
				console.log('selectedLabel', {selectedLabel});
				userSelections = selectedLabel; 
				await showModal(interaction); //呼叫modal給使用者填寫表單
			}
		}
		else if (interaction.isButton()) { //當使用者點擊回復按鈕
			const userInfo = {
				nickname: interaction.member.nickname || interaction.user.username,
				modalContent: modalContent,
				botReply: botReply,
				buttonId: interaction.customId,
				timestamp: new Date(interaction.createdTimestamp).toISOString(),
			};
			let responseMessage = botReply;
			console.log('responseMessage', responseMessage);
			await textSave(userInfo); //將使用者提問 回復 回復回饋存入json
			if (interaction.customId === 'useful') {
				responseMessage += `\n很高興您滿意這次的回答，下次見！`;
				await interaction.update({ content: responseMessage, components: [] });
			}
			else if (interaction.customId === 'useless') {
				responseMessage += `\n感謝您的回饋，我們會持續精進系統！`;
				await interaction.update({ content: responseMessage, components: [] });

			}
			else if (interaction.customId === 'continue') {
				responseMessage += `\n謝謝！`; //將原本機器人回答再各個按鈕不同回答
				await interaction.update({ content: responseMessage, components: [] });

			}
		}
	},
};