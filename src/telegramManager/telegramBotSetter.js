import TelegramBot from 'node-telegram-bot-api';
import global from '../../global.js';
import 'dotenv/config'


const token = process.env.TELEGRAM_TOKEN;
console.log("token: " + token);
console.log("DEBUG: " + global.DEBUG);
if (!token) {
    throw new Error('Missing TELEGRAM_TOKEN');
}

const chatID = process.env.TELEGRAM_CHAT_ID;
console.log("chatID: " + chatID);
if (!chatID) {
    throw new Error('Missing TELEGRAM_CHAT_ID');
}


const telegramBot = new TelegramBot(token, {polling: true});

export default telegramBot;