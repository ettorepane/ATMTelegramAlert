import telegramBot from "./telegramBotSetter.js";
import chalk from 'chalk';
import global from "../../global.js";
import moment from "moment-timezone";

function newAlert() {
    //only send between 6 and 24 
    //note: this program is running on a server in a different timezone witch we don't know
    //so we need to check the time in italy
    //npm i timezone
    var time = new Date();
    var hours = time.getHours();
    if (hours < 6 || hours > 24) {
        console.log(chalk.gray('No alert sent, time: ' + hours));
        return;
    }
    // bot.sendMessage("@statoatm", 'New Alert');
    var message = '';
    //ENSURE WE USE THE RIGHT EMOJI
    if (global.alertMessage.includes('sciopero')) {
        message += '🚫 AGGIORNAMENTI SCIOPERO';
    } else {
        message += '⚠️ AGGIORNAMENTO';
    }
    message += '\n\n';
    if (global.newAlertMessage) {
        message += "📢 Nuovo avviso: \n" + global.alertMessage;
        message += '\n';
        global.alertMessages.forEach(alert => {
            message += removeTags(alert) + '\n';
        });
        message += '\n\n';
    }
    if (global.newAlertLineFlag) {
        message += "🚇 Stato metro cambiato: \n";
        global.metroLines.forEach(metro => {
            var emojiColor = '';
            switch (metro.name) {
                case 'M1':
                    emojiColor = '🔴';
                    break;
                case 'M2':
                    emojiColor = '🟢';
                    break;
                case 'M3':
                    emojiColor = '🟡';
                    break;
                case 'M4':
                    emojiColor = '🟣';
                    break;
                case 'M5':
                    emojiColor = '🔵';
                    break;
                default:
                    emojiColor = '⚫';
                    break;
            }
            if (metro.status.includes('Regolare')) {
                message += emojiColor + ' ' + metro.name + ' Stato: ' + metro.status + ' ✅\n';
            }
            else {
                //attention icon
                message += emojiColor + ' ' + metro.name + ' Stato: ' + metro.status + ' ❗️\n';
            }
        });
        message += '\n\n';
    } else {
        message += "🚇 Metro invariate dallo scorso update \n\n";
    }
    if (global.newAlertLineMessageFlag) {
        message += "AVVISO METRO: \n" + removeTags(global.alertLine);
        message += '\n\n';
    }
    var italianTime = moment().tz("Europe/Rome").format('HH:mm');
    message += '🕐 Ultimo aggiornamento: ' +  italianTime;
    
    if(!global.DEBUG)
        telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    else {
        console.log(chalk.red('DEBUG MODE!!!! THIS MESSAGE IS NOT SENDED!!!!'));
        console.log(message);
    }

    global.newAlertFlag = false;
    global.newAlertLineFlag = false;
    global.newAlertMessage = false;
    global.newAlertLineMessageFlag = false;
}

function removeTags(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
    //also remove &nbsp;
    return str.replace( /(<([^>]+)>)/ig, '').replace(/&nbsp;/ig, '');
 }

export default newAlert;