
import { CronJob } from 'cron';
import { run } from './src/ATMWrapper/wrapper.js';
import chalk from 'chalk';
import newAlert from './src/telegramManager/newAlert.js';
import global from './global.js';


console.log(chalk.gray('Starting...'));

//DEBUG SEQUENCE
if (global.DEBUG) {
    console.log(chalk.red('DEBUG MODE!!!! THIS WILL NOT SEND ANY MESSAGE!!!!'));
    global.alertMessage = 'SCIOPERO DEBUG';
    global.alertMessages = ['SCIOPERO MESS 1', 'SCIOPERO MESS 2'];
    global.alertLine = 'LINEA M2 CHIUSA PER: Debug';
    global.metroLines[0].status = 'Regolare';
    global.metroLines[1].status = 'Tratta Sospesa';
    global.metroLines[2].status = 'Regolare';
    global.metroLines[3].status = 'Chiusa';
    global.metroLines[4].status = 'Regolare';
    global.newAlertFlag = true;
    global.newAlertMessage = true;
    global.newAlertLineFlag = true;
    global.newAlertLineMessageFlag = true;
    newAlert();
}

//evert 5 minutes cron
run();
var job = new CronJob('*/5 * * * *', function() {
    run();
}, null, true, 'Europe/Rome');



