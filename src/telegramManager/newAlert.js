import telegramBot from "./telegramBotSetter.js";
import chalk from 'chalk';
import global from "../../global.js";
import moment from "moment-timezone";

function newAlert() {
    //only send between 6 and 24 
    //note: this program is running on a server in a different timezone witch we don't know
    //so we need to check the time in italy
    //use moment
    var italianTime = moment().tz("Europe/Rome").format('HH');
    if (italianTime < 6 || italianTime > 23) {
        console.log(chalk.red('Not sending message, time is: ' + italianTime));
        return;
    }
    var message = '';

    var morningMessage = false;
    if (moment().tz("Europe/Rome").format('HH:mm') == global.morningMessageHour) {
        morningMessage = true;
        //use sunrise emoji
        message += '🌅 Buongiorno! Ecco lo situazione attuale:\n\n';
        global.newAlertFlag = true;
        if(global.alertMessage)
            global.newAlertLineFlag = true;
        else
            message += 'Non ci sono avvisi in bacheca \n\n';
    }

    
    // bot.sendMessage("@statoatm", 'New Alert');
    //ENSURE WE USE THE RIGHT EMOJI
    if (global.alertMessage.includes('sciopero')) {
        message += '🚫 AGGIORNAMENTI SCIOPERO';
    } else if (!morningMessage) {
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
        if(!morningMessage)
            message += "🚇 Stato metro cambiato: \n";
        else
            message += "🚇 Stato metro attuale: \n";
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

    if (morningMessage) {
        message += '\n\n';
        message += '🔔 Notifica mattutina - Buona giornata!';
    } else
        message += '🕐 Ultimo aggiornamento: ' +  italianTime;

    var italianTime = moment().tz("Europe/Rome").format('HH');
    

    if(!global.DEBUG)
        if(italianTime <= 21 && italianTime >= 7)  
            //dalle 7 alle 22
            telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
        else {
            console.log(chalk.red('SENDING SILENT MESSAGE NIGHT MODE'));
            message += '\n (notifica silenziosa, modalità notte)';
            telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {disable_notification: true});
        }
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