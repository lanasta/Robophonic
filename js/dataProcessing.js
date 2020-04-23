document.addEventListener("DOMContentLoaded", function() {
    // Handler when all assets (including images) are loaded
    var lightModeMap = {}
    var rgbIncremental = 0;
    for (var i = 0; i <= 10; i+= 1) {
        lightModeMap[i] = "rgb(" + rgbIncremental + ", " + rgbIncremental + ", 0)"
        rgbIncremental += 25.5
    }
    let lightMode = 0
    let lowerRange = 800
    let upperRange = 2000
    let incrementalValue = (upperRange - lowerRange) / 10
    let frequencyLightLevels = []
    for (var i = lowerRange; i <= upperRange; i += incrementalValue) {
        frequencyLightLevels.push(i)
    }

    console.log(frequencyLightLevels)   
    console.log(lightModeMap)

      /* Phyphox configuration. If using Mac, get rid of the :8080 at the end. 
    If using Windows, add :8080 at the end. The PP_ADDRESS differs for each person, 
    and can be found on the phyphox app on your phones */
    const PP_ADDRESS = "http://192.168.0.143" 
    const PP_CHANNELS = ["frequency", "semitonesRound", "centsDiff"]  // Names of the buffers in the phyphox experiement we want to pull data from
    const sampling_rate = 100  // Sampling at 100 Hz

    // Animation and data collection config
    const PREV_SAMPLE = 100                   // Size of the buffer of past data that we want to display in the graph
    const INTERVALS = 1000 / sampling_rate    // Interval to delay between data collection repetitions
    const WHISTLE_MAX_FREQ = 5000  // Maximum frequency in whistling range
    const WHISTLE_MIN_FREQ = 500  // Minimum frequency in whistling range

    // Global var to save timestamp
    let xs = []

    // Global arrays to save frequency data
    let peak_frequencies = [], musical_notes = [], cents_from_notes = []

    // Make one of them true at a time --> Determines if collect data or generate live graph
    let isAnimate = false
    let isCollectData = true

    let url = PP_ADDRESS + "/get?" + PP_CHANNELS.join("&")

    let getData = async() => {
        fetch(url).then(response => {
            return response.json();
          }).then(data => {
            // Work with JSON data here
            console.log(data);
          }).catch(err => {
            // Do something for an error here
          });
        // http.get(url, (resp) => {
        // let receivedData = ''
        // // A chunk of data has been recieved.
        // resp.on('data', (chunk) => {
        //     receivedData += chunk
        //     let data = JSON.parse(receivedData)
        //     if (!data["buffer"]) return
        //     let temp_peak_frequency = data["buffer"][PP_CHANNELS[0]]["buffer"][0]
        //     let temp_musical_note = data["buffer"][PP_CHANNELS[1]]["buffer"][0]
        //     let temp_cents_from_note = data["buffer"][PP_CHANNELS[2]]["buffer"][0]
        //     if (temp_peak_frequency == "nan" || temp_musical_note == "nan" || temp_cents_from_note == "nan" || temp_peak_frequency < WHISTLE_MIN_FREQ || temp_peak_frequency > WHISTLE_MAX_FREQ) {
        //         lightMode = 0
        //         return
        //     }
        //     var date = new Date()
        //     let myNote = frequencyMap.noteFromFreq(temp_peak_frequency)
        //     peak_frequencies.push([date.getTime(), temp_peak_frequency])
        //     musical_notes.push([date.getTime(), temp_musical_note])
        //     cents_from_notes.push([date.getTime(), temp_cents_from_note])
        //     setLight( determineLightMode(temp_peak_frequency));
        //     console.log(date.getTime(), temp_peak_frequency, MUSICAL_NOTES_MAP[temp_musical_note], temp_cents_from_note)
        // })
        // }).on("error", (err) => {
        //     setLight(0)
        //     console.log("Error: " + err.message)
        // })
    }

    let setLight = (mode) => {
        var elems = document.getElementsByClassName("lightSource");
        if (mode == 0) {
            elems[0].style.display = 'none';
        } else {
            elems[0].style.display = 'block';
            elems[0].style.backgroundColor = lightModeMap[mode];
        }
    }

    let determineLightMode = (frequency) => {
        if (frequency <= frequencyLightLevels[0]) {
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
    
        document.getElementsByName("lFreq")[0].addEventListener('input', processInput);
        document.getElementsByName("hFreq")[0].addEventListener('input', processInput);

        function calibrate(){
            var low = document.getElementById("lFreq").value;
            var high = document.getElementById("hFreq").value;
        }

        function processInput() {
            var low = document.getElementById("lFreq").value;
            var high = document.getElementById("hFreq").value;
            var btn = document.getElementById("startInteraction");
            if (high-low >= 100) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        }

    
        setInterval(() => {
            getData()
        }, INTERVALS)
    });


