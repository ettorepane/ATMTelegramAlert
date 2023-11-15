// Description: Global variables
var global = {
    DEBUG : false,
    morningMessageHour : "07:00",
    alertMessage: '',
    alertLine: '',
    alertMessages: [],
    lastUpdate: '',
    metroLines: [
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
    ],
    newAlertFlag: false,
    newAlertMessage: false,
    newAlertLineFlag: false,
    newAlertLineMessageFlag: false
}

export default global;