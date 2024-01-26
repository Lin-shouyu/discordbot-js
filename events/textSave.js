const fs = require('fs').promises;

async function textSave(userInfo) {
	try {
		const data = JSON.stringify(userInfo, null, 4);
		await fs.writeFile('userInteractionData.json', data, { flag: 'a' }); // 'a' 代表追加模式
		console.log('數據已儲存');
	} catch (error) {
		console.error('寫入文件時出錯：', error);
	}
}

module.exports = { textSave };