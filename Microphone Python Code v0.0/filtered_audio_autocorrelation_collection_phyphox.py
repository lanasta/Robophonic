# Works with the "Audio Autocorrelation" Experiment in Phyphox
# Extracts peak frequency, musical note, and cents from note

import requests
import time
import datetime as dt
import matplotlib.pyplot as plt
import matplotlib.animation as anim

# Phyphox configuration
PP_ADDRESS = "http://192.168.1.5:8080"
PP_CHANNELS = ["frequency", "semitonesRound", "centsDiff"]  # Names of the buffers in the phyphox experiement we want to pull data from
sampling_rate = 100  # Sampling at 100 Hz

# Animation and data collection config
PREV_SAMPLE = 100                   # Size of the buffer of past data that we want to display in the graph
INTERVALS = 1000 / sampling_rate    # Interval to delay between data collection repetitions
WHISTLE_MAX_FREQ = 3000  # Maximum frequency in whistling range
WHISTLE_MIN_FREQ = 400  # Minimum frequency in whistling range


# Create figure for plotting
fig = plt.figure()
ax = fig.add_subplot(1, 1, 1)

# Global var to save timestamp
xs = []

# Global arrays to save frequency data
peak_frequency = []
musical_note = []
cents_from_note = []

# Make one of them true at a time --> Determines if collect data or generate live graph
isAnimate = False
isCollectData = True

# Function to get sensor data from phyphox
def getSensorData():
    url = PP_ADDRESS + "/get?" + ("&".join(PP_CHANNELS))
    data = requests.get(url=url).json()

    # Data comes into the program as a nested dictionary
    # Use keys to index down into dictionary and extract data from each buffer in the experiment
    temp_peak_frequency = data["buffer"][PP_CHANNELS[0]]["buffer"][0]
    temp_musical_note = data["buffer"][PP_CHANNELS[1]]["buffer"][0]
    temp_cents_from_note = data["buffer"][PP_CHANNELS[2]]["buffer"][0]

    # If frequency value detected is None, return None for every variable
    if temp_peak_frequency is None:

        temp_peak_frequency = None
        temp_musical_note = None
        temp_cents_from_note = None

        return [temp_peak_frequency, temp_musical_note, temp_cents_from_note]

    # Else if frequency detected is outside of whistling frequency, return None for every variable
    elif temp_peak_frequency < WHISTLE_MIN_FREQ or temp_peak_frequency > WHISTLE_MAX_FREQ:

        temp_peak_frequency = None
        temp_musical_note = None
        temp_cents_from_note = None

        return [temp_peak_frequency, temp_musical_note, temp_cents_from_note]

    # Else return the measured values
    else:

        return [temp_peak_frequency, temp_musical_note, temp_cents_from_note]


# This function is called periodically from FuncAnimation
def animate(i, graph_xs, graph_peak_frequency):
    #Get new values
    [new_peak_frequency, new_musical_note, new_cents_from_note] = getSensorData()

    # Append new value of time to xs
    graph_xs.append(dt.datetime.now().strftime('%S.%f'))  # %H:%M:%S.%f

    # Append new value of peak frequency to the corresponding array
    graph_peak_frequency.append(new_peak_frequency)

    # Plot only the 50 (PREV_SAMPLE) previous samples
    _peak_frequency = graph_peak_frequency[-PREV_SAMPLE:]
    _xs = graph_xs[-PREV_SAMPLE:]

    # Clear the plot
    ax.clear()

    # Update the plot
    ax.plot(_xs, _peak_frequency, label='Peak Frequency')

    ax.legend(loc='upper left')
    plt.xticks(rotation=45, ha='right')
    plt.subplots_adjust(bottom=0.30)


def getData():
    [new_peak_frequency, new_musical_note, new_cents_from_note] = getSensorData()  # get nth sample

    # Update time
    t = dt.datetime.now().strftime('%M:%S.%f')  # %H:%M:%S.%f
    xs.append(t)

    # Update arrays containing sensor data (append nth value to the end of the array)
    peak_frequency.append(new_peak_frequency)
    musical_note.append(new_musical_note)
    cents_from_note.append(new_cents_from_note)

    return [t, new_peak_frequency, new_musical_note, new_cents_from_note]


def main():
    if isAnimate == True:
        # Interval in milliseconds
        ani = anim.FuncAnimation(fig, animate, fargs=(xs, peak_frequency), interval=INTERVALS, repeat=True)
        plt.show()
    if isCollectData == True:
        while True:
            [t, npeak_frequency, nmusical_note, ncents_from_note] = getData()
            print(t, ' ', npeak_frequency, ' ', nmusical_note, ' ', ncents_from_note)
            time.sleep(INTERVALS / 1000)  # Delays for INTERVALS seconds.


if __name__ == '__main__':
    main()


