const http = require('http')
const fs = require('fs')
const express = require("express")
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000
app.listen(port, () => {
 console.log("Server running on port ", port)
})
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


const { MUSICAL_NOTES_MAP } = require('./musicalNotesMapping') //To get the user friendly form of the musical notes returned
const frequencyMap = require('note-frequency-map')
let lightMode = 0
let frequencyLightLevels = []

/* Phyphox configuration. If using Mac, get rid of the :8080 at the end. 
If using Windows, add :8080 at the end. The PP_ADDRESS differs for each person, 
and can be found on the phyphox app on your phones */
let PP_ADDRESS = ""
const PP_CHANNELS = ["frequency", "semitonesRound", "centsDiff"]  // Names of the buffers in the phyphox experiement we want to pull data from
const sampling_rate = 100  // Sampling at 100 Hz
let url = ""

app.get("/lightStatus", (req, res, next) => {
    res.json({"status" : lightMode })
})

app.post('/setPPAddress',(req, res) => {
    PP_ADDRESS = req.body.address
    console.log(PP_ADDRESS)
    url = PP_ADDRESS + "/get?" + PP_CHANNELS.join("&")
    res.send('Success.')
})

app.post('/setRange',(req, res) => {
    let lowerRange = req.body.lowerRange
    let upperRange = req.body.upperRange
    res.send('Success.')
    frequencyLightLevels = []
    let range = (upperRange - lowerRange)
    let levelCount = 10
    let incrementalValue = parseFloat(range / levelCount)
    for (var i = 0; i < 10; i ++) {
        frequencyLightLevels.push(parseFloat(lowerRange) + parseFloat(incrementalValue*i))
    }
    console.log(frequencyLightLevels)
})



// Animation and data collection config
const PREV_SAMPLE = 100                   // Size of the buffer of past data that we want to display in the graph
const INTERVALS = 1000 / sampling_rate    // Interval to delay between data collection repetitions
const WHISTLE_MAX_FREQ = 5000  // Maximum frequency in whistling range
const WHISTLE_MIN_FREQ = 100  // Minimum frequency in whistling range

// Global var to save timestamp
let xs = []

// Global arrays to save frequency data
let peak_frequencies = [], musical_notes = [], cents_from_notes = []

// Make one of them true at a time --> Determines if collect data or generate live graph
let isAnimate = false
let isCollectData = true


let getData = async() => {
    http.get(url, (resp) => {
    let receivedData = ''
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        receivedData += chunk
        let data = JSON.parse(receivedData)
        if (!data["buffer"]) return
        let temp_peak_frequency = data["buffer"][PP_CHANNELS[0]]["buffer"][0]
        let temp_musical_note = data["buffer"][PP_CHANNELS[1]]["buffer"][0]
        let temp_cents_from_note = data["buffer"][PP_CHANNELS[2]]["buffer"][0]
        if (temp_peak_frequency == "nan" || temp_musical_note == "nan" || temp_cents_from_note == "nan" || temp_peak_frequency < WHISTLE_MIN_FREQ || temp_peak_frequency > WHISTLE_MAX_FREQ) {
            lightMode = 0
            return
        }
        var date = new Date()
        let myNote = frequencyMap.noteFromFreq(temp_peak_frequency)
        peak_frequencies.push([date.getTime(), temp_peak_frequency])
        musical_notes.push([date.getTime(), temp_musical_note])
        cents_from_notes.push([date.getTime(), temp_cents_from_note])
        lightMode = determineLightMode(temp_peak_frequency)
        console.log('light mode', lightMode)
        // this node library accurately maps frequencies to musical notes, an option we can use and omit later if not needed
       // console.log(myNote.note) 
       console.log(date.getTime(), temp_peak_frequency, MUSICAL_NOTES_MAP[temp_musical_note], temp_cents_from_note)
    })
    }).on("error", (err) => {
        lightMode = 0
        console.log("Error: " + err.message)
    })
}

let determineLightMode = (frequency) => {
    if (frequencyLightLevels.length < 10 || frequency <= frequencyLightLevels[0]) {
        return 0;
    } else if (frequency <= frequencyLightLevels[1]) {
        return 1;
    } else if (frequency <= frequencyLightLevels[2]) {
        return 2;
    } else if (frequency <= frequencyLightLevels[3]) {
        return 3;
    } else if (frequency <= frequencyLightLevels[4]) {
        return 4;
    } else if (frequency <= frequencyLightLevels[5]) {
        return 5;
    } else if (frequency <= frequencyLightLevels[6]) {
        return 6;
    } else if (frequency <= frequencyLightLevels[7]) {
        return 7;
    } else if (frequency <= frequencyLightLevels[8]) {
        return 8;
    } else if (frequency <= frequencyLightLevels[9]) {
        return 9;
    } else {
        return 10;
    }
}

setInterval(() => {
    if (PP_ADDRESS != "" && url != "") {
        getData()
    }
}, INTERVALS)
