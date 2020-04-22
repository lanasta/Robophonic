To run this program, make sure you have Node installed on your computer. 
It is worth looking at Youtube tutorials on how to do that if it us not that straightforward for you.

Set up your Node.js development environment directly on Windows:
https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows

If you are looking for a text editor, VSCode is a good one and will let you use the terminal in the same window.
Once you are able to navigate into the "js" folder through the Terminal, start up the Audio Correlation experiment on your Phyphox app. 
First, enable remote access and then go to index.js, search the PP_ADDRESS variable and modify it based on the url you see on the Phyphox app on your phone. Add/omit the ":8080" bit at the end based on your operating system (Omit if Mac, add if Windows). 
Press the play button on the Phyphox experiment.

Then run the following command:

```npm i && node index.js```

If you did not get any errors, you can open http://localhost:8000. 
Start whistling or making high pitch noises to your phone, and you should observe the light turn off and on. Off when low-pitch or no sound, on when high-pitch or whistling.
