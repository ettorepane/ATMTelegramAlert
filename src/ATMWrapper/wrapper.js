import puppeteer from 'puppeteer-core';
import chalk from 'chalk';
import newAlert from '../telegramManager/newAlert.js';
import global from '../../global.js';

async function run() {
    console.log(chalk.gray('5 Minutes, full check...'));
    global.lastUpdate = new Date();
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
   //screenshot 1920x1080
    await page.screenshot({path: 'atm.png', fullPage: true});
    try {
    const text = await page.evaluate(() => {
        const title = document.querySelector('#Alert_Titolo');
        return title.innerHTML;
    });
    if (text != global.alertMessage) {
        global.alertMessage = text;
        console.log(chalk.red('NEW ALERT: ') + chalk.blue(text));
        global.newAlertFlag = true;
        global.newAlertMessage = true;
    }
        var alertMessagesLocal = await page.evaluate(() => {
            var messages = [];
            var alertMessages = document.getElementsByClassName('Alert_m_testo')[0].getElementsByTagName('p');
            for (var i = 0; i < alertMessages.length; i++) {
                messages.push(alertMessages[i].innerHTML);
            }
            return messages;
        });
        //check if alertMessagesLocal is equal to alertMessages, if not, send alert
        for (var i = 0; i < alertMessagesLocal.length; i++) {
            if (alertMessagesLocal[i] != alertMessages[i]) {
                console.log(chalk.red('NEW ALERT MESSAGE: ') + chalk.blue(alertMessagesLocal[i]));
                global.alertMessages = alertMessagesLocal;
                newAlertFlag = true;
                newAlertMessage = true;
                break;
            }
        }  
    } catch (error) {
        console.log(chalk.gray('No alert!' + error + ' '));
        global.alertMessage = '';
        global.alertMessages = [];
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
        if (metroLinesLocal[i].status != global.metroLines[i].status) {
            console.log(chalk.red('LINE CHANGED STATUS: ') + chalk.green(global.metroLines[i].name) + chalk.red(' OLD: ') + chalk.blue(global.metroLines[i].status) + chalk.red(' NEW: ') + chalk.blue(metroLinesLocal[i].status));
            global.newAlertFlag = true;
            global.newAlertLineFlag = true;
        }
    }
    global.metroLines = metroLinesLocal;


    /*
        <span id="ctl00_SPWebPartManager1_g_9b06731f_460e_4533_a288_117c67e46987_ctl00_StatusLinee_lb_Mex" class="StatusLinee_Mex_Testo">M5 è in servizio tra Bignami e Zara (sciopero), l'intera linea riapre alle 15. A Ca' Granda scendete e cambiate binario per proseguire il viaggio. 
            
    */

    try{
        var alertLineLocal = await page.evaluate(() => {
            var alertLine = document.getElementsByClassName('StatusLinee_Mex_Testo')[0].innerHTML;
            return alertLine;
        }
        );

        if (alertLineLocal != global.alertLine) {
            global.alertLine = alertLineLocal;
            console.log(chalk.red('NEW ALERT LINE: ') + chalk.blue(global.alertLine));
            global.newAlertFlag = true;
            global.newAlertLineMessageFlag = true;
        }
    } 
    catch (error) {
        console.log(chalk.gray('No alert line'));
        global.alertLine = '';
    }

    await browser.close();
    console.log(chalk.gray('---Full check completed---'));
    if (global.newAlertFlag) {
        newAlert();
    }
}



export { run };