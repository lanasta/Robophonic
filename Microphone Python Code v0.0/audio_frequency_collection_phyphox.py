# First spin at getting microphone data from phyphox into python
# At this point, only pulling in peak frequency musical note (encoded as a number) and cents from note
# To access the full frequency spectrum, we might need to do some more gymnastics


import requests
import time
import datetime as dt
import matplotlib.pyplot as plt
import matplotlib.animation as anim



#phyphox configuration
PP_ADDRESS = "http://192.168.1.5:8080"
PP_CHANNELS = ["f0", "semitonesRound", "centsDiff"]   #Names of the buffers in the phyphox experiement we want to pull data from
sampling_rate = 20  #FFT performed on data in audio buffer once every 0.05 seconds

#animation and data collection config
PREV_SAMPLE = 50  #Size of the buffer of past data that we want to display in the graph
INTERVALS = 1000/sampling_rate  #Interval to delay between data collection repetitions

# Create figure for plotting
fig = plt.figure()
ax = fig.add_subplot(1, 1, 1)

#Global var to save timestamp
xs = []

# Global array to save frequency data
peak_frequency =[]
musical_note = []
cents_from_note = []

# Make one of them true at a time --> Determines if collect data or create live graph
isAnimate = False     #todo get frequency over time animation working--> errors out after ~10 seconds
isCollectData = True


def getSensorData():
    url = PP_ADDRESS + "/get?" + ("&".join(PP_CHANNELS))
    data = requests.get(url=url).json()    #Data comes into program as a nested dictionary

    # Use keys to index down into dictionary and extract data from each buffer in the experiment
    peak_frequency = data["buffer"][PP_CHANNELS[0]]["buffer"][0]
    musical_note = data["buffer"][PP_CHANNELS[1]]["buffer"][0]
    cents_from_note = data["buffer"][PP_CHANNELS[2]]["buffer"][0]

    return [peak_frequency, musical_note, cents_from_note]
    


# In[11]:


# This function is called periodically from FuncAnimation
def animate(i, xs, peak_frequency):
    [npeak_frequency, nmusical_note, ncents_from_note] = getSensorData()

    # Append new value of time to xs
    xs.append(dt.datetime.now().strftime('%S.%f')) #%H:%M:%S.%f

    # Append new values of each variable to the corresponding array
    peak_frequency.append(npeak_frequency)
    musical_note.append(nmusical_note)
    cents_from_note.append(ncents_from_note)

     # Plot only the 50 (PREV_SAMPLE) previous samples
    _peak_frequency = peak_frequency[-PREV_SAMPLE:]
    _musical_note = musical_note[-PREV_SAMPLE:]
    _cents_from_note = cents_from_note[-PREV_SAMPLE:]

    xs = xs[-PREV_SAMPLE:]

    ax.clear()

   # todo adjust to plot whatever it is we want to see in real time
    ax.plot(xs, peak_frequency, label='Peak Frequency')

    ax.legend(loc = 'upper left')
    plt.xticks(rotation=45, ha='right')
    plt.subplots_adjust(bottom=0.30)


def getData():
    [npeak_frequency, nmusical_note, ncents_from_note] = getSensorData() # get nth sample

    #Update time
    t = dt.datetime.now().strftime('%M:%S.%f') #%H:%M:%S.%f
    xs.append(t)

    #Update arrays containing sensor data (append nth value to the end of the array)
    peak_frequency.append(npeak_frequency)
    musical_note.append(nmusical_note)
    cents_from_note.append(ncents_from_note)

    return [t, npeak_frequency, nmusical_note, ncents_from_note]
    
    
def main():
    if isAnimate == True:
        #interval in milliseconds
        ani = anim.FuncAnimation(fig, animate, fargs=(xs, peak_frequency), interval=INTERVALS, repeat = True)
        plt.show()
    if isCollectData == True:
       while True:
          [t, npeak_frequency, nmusical_note, ncents_from_note] = getData()
          print(t, ' ', npeak_frequency, ' ', nmusical_note, ' ', ncents_from_note)
          time.sleep(INTERVALS/1000)   # Delays for INTERVALS seconds.

if __name__ == '__main__':
    main()


