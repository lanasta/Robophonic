const http = require('http')
const fs = require('fs')
const express = require("express")
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.static('public'))
app.listen(3000, () => {
 console.log("Server running on port 3000")
})

const { MUSICAL_NOTES_MAP } = require('./musicalNotesMapping') //To get the user friendly form of the musical notes returned
const frequencyMap = require('note-frequency-map')
let lightMode = 0

app.get("/lightStatus", (req, res, next) => {
    res.json({"status" : lightMode })
})

//Go to http://localhost:8000 to see UI (only after running "node index.js")
fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err 
    }       
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"})  
        response.write(html)  
        response.end()  
    }).listen(8000)
})

/* Phyphox configuration. If using Mac, get rid of the :8080 at the end. 
If using Windows, add :8080 at the end. The PP_ADDRESS differs for each person, 
and can be found on the phyphox app on your phones */
const PP_ADDRESS = "http://192.168.0.6" 
const PP_CHANNELS = ["frequency", "semitonesRound", "centsDiff"]  // Names of the buffers in the phyphox experiement we want to pull data from
const sampling_rate = 100  // Sampling at 100 Hz

// Animation and data collection config
const PREV_SAMPLE = 100                   // Size of the buffer of past data that we want to display in the graph
const INTERVALS = 1000 / sampling_rate    // Interval to delay between data collection repetitions
const WHISTLE_MAX_FREQ = 3000  // Maximum frequency in whistling range
const WHISTLE_MIN_FREQ = 400  // Minimum frequency in whistling range

// Global var to save timestamp
let xs = []

// Global arrays to save frequency data
let peak_frequencies = [], musical_notes = [], cents_from_notes = []

// Make one of them true at a time --> Determines if collect data or generate live graph
let isAnimate = false
let isCollectData = true

let url = PP_ADDRESS + "/get?" + PP_CHANNELS.join("&")

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
        lightMode = 1
        // this node library accurately maps frequencies to musical notes, an option we can use and omit later if not needed
        console.log(myNote.note) 
        console.log(date.getTime(), temp_peak_frequency, MUSICAL_NOTES_MAP[temp_musical_note], temp_cents_from_note)
    })
    }).on("error", (err) => {
        lightMode = 0
        console.log("Error: " + err.message)
    })
}

setInterval(() => {
    getData()
}, INTERVALS)
