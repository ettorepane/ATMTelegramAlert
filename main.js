import chalk from 'chalk';
import puppeteer from 'puppeteer-core';
import { arrayBuffer } from 'stream/consumers';
import { CronJob } from 'cron';
import TelegramBot from 'node-telegram-bot-api';
import timezone from 'timezone';


const token = '6724735632:AAEkNyWsCSH4sLoKytZvMi75V8xt8I7bv2E';

const bot = new TelegramBot(token, {polling: true});




//we need to dump atm.it

var alertMessage = '';

var alertLine = '';

var lastUpdate = '';

var metroLines = [
    {
        name: 'M1',
        status: 'Regolare',
    },
    {
        name: 'M2',
        status: 'Regolare',
    },
    {
        name: 'M3',
        status: 'Regolare',
    },
    {
        name: 'M4',
        status: 'Regolare',
    },
    {
        name: 'M5',
        status: 'Regolare',
    }
]

var newAlertFlag = false;
var newAlertMessage = false;
var newAlertLineFlag = false;
var newAlertLineMessageFlag = false;


async function run() {
    console.log(chalk.gray('5 Minutes, full check...'));
    lastUpdate = new Date();
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.goto('https://atm.it');
   /*
        <div id="Alert_Titolo" class="Alert_Titolo">Aggiornamento sciopero: riapre M5 tra Zara e Bignami. </div>
        we need to get the text inside the div
    */
   //screenshot 1920x1080
    await page.screenshot({path: 'atm.png', fullPage: true});
    try {
    const text = await page.evaluate(() => {
        const title = document.querySelector('#Alert_Titolo');
        return title.innerHTML;
    });
    if (text != alertMessage) {
        alertMessage = text;
        console.log(chalk.red('NEW ALERT: ') + chalk.blue(text));
        newAlertFlag = true;
        newAlertMessage = true;
    }
    } catch (error) {
        console.log(chalk.gray('No alert'));
    }
   

    var metroLinesLocal = await page.evaluate(() => {
        var lines = [];
        for( var i = 0; i < 5; i++) {
            var metroLine = document.getElementsByClassName('StatusLinee_Linea')[i];
            var metroLineName = metroLine.getElementsByTagName('img')[0].alt;
            var metroLineStatus = document.getElementsByClassName('StatusLinee_StatoScritta')[i].innerHTML;
            //status no extra spaces at the end
            metroLineStatus = metroLineStatus.trim();
            lines.push({
                name: metroLineName,
                status: metroLineStatus
            });
        }
        return lines;
    }
    );
    //check if metroLinesLocal is equal to metroLines, if not, send alert
    for (var i = 0; i < 5; i++) {
        if (metroLinesLocal[i].status != metroLines[i].status) {
            console.log(chalk.red('LINE CHANGED STATUS: ') + chalk.green(metroLines[i].name) + chalk.red(' OLD: ') + chalk.blue(metroLines[i].status) + chalk.red(' NEW: ') + chalk.blue(metroLinesLocal[i].status));
            newAlertFlag = true;
            newAlertLineFlag = true;
        }
    }
    metroLines = metroLinesLocal;


    /*
        <span id="ctl00_SPWebPartManager1_g_9b06731f_460e_4533_a288_117c67e46987_ctl00_StatusLinee_lb_Mex" class="StatusLinee_Mex_Testo">M5 è in servizio tra Bignami e Zara (sciopero), l'intera linea riapre alle 15. A Ca' Granda scendete e cambiate binario per proseguire il viaggio. 
            
    */

    try{
        var alertLineLocal = await page.evaluate(() => {
            var alertLine = document.getElementsByClassName('StatusLinee_Mex_Testo')[0].innerHTML;
            return alertLine;
        }
        );

        if (alertLineLocal != alertLine) {
            alertLine = alertLineLocal;
            console.log(chalk.red('NEW ALERT LINE: ') + chalk.blue(alertLine));
            newAlertFlag = true;
            newAlertLineMessageFlag = true;
        }
    } 
    catch (error) {
        console.log(chalk.gray('No alert line'));
    }

    

    await browser.close();
    console.log(chalk.gray('---Full check completed---'));
    if (newAlertFlag) {
        newAlert();
    }
}

function newAlert() {
    //only send between 6 and 24 
    //note: this program is running on a server in a different timezone witch we don't know
    //so we need to check the time in italy
    //npm i timezone
    var time = new Date();
    var italyTime = timezone(time, '%H', 'it_IT');
    if (italyTime < 6 || italyTime > 24) {
        console.log(chalk.gray('No alert sent, its night...'));
        newAlertFlag = false;
        newAlertLineFlag = false;
        newAlertMessage = false;
        newAlertLineMessageFlag = false;
        return;
    }
    // bot.sendMessage("@statoatm", 'New Alert');
    var message = '';
    //ENSURE WE USE THE RIGHT EMOJI
    if (alertMessage.includes('sciopero')) {
        message += '🚫 AGGIORNAMENTI SCIOPERO';
    } else {
        message += '⚠️ AGGIORNAMENTO';
    }
    message += '\n\n';
    if (newAlertMessage) {
        message += "📢 Nuovo avviso: \n" + alertMessage;
        message += '\n\n';
    }
    if (newAlertLineFlag) {
        message += "🚇 Stato metro cambiato: \n";
        metroLines.forEach(metro => {
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
    if (newAlertLineMessageFlag) {
        message += "AVVISO METRO: \n" + alertLine;
        message += '\n\n';
    }

    message += '🕐 Ultimo aggiornamento: ' + lastUpdate.getHours() + ':' + lastUpdate.getMinutes();

    bot.sendMessage("@statoatm", message);

    newAlertFlag = false;
    newAlertLineFlag = false;
    newAlertMessage = false;
    newAlertLineMessageFlag = false;
}
//evert 5 minutes cron
run();
var job = new CronJob('*/5 * * * *', function() {
    run();
}, null, true, 'Europe/Rome');

