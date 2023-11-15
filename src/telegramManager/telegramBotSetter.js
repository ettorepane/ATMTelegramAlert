import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    throw new Error('Missing TELEGRAM_TOKEN');
}

if (process.env.TELEGRAM_CHAT_ID) {
    throw new Error('Missing TELEGRAM_CHAT_ID');
}


const telegramBot = new TelegramBot(token, {polling: true});

export default telegramBot;