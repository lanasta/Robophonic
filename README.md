To run this program, make sure you have Node installed on your computer. 
It is worth looking at Youtube tutorials on how to do that if it us not that straightforward for you.

Set up your Node.js development environment directly on Windows:
https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows

If you are looking for a text editor, VSCode is a good one and will let you use the terminal in the same window. Navigate to the project on a text editor or through PowerShell/Terminal. Start up the Audio Correlation experiment on your Phyphox app. First, enable remote access on Phyhox. Then run the following command:

```npm start```

If you did not get any errors, you can open http://localhost:3000. Set your Phyphox address and modify it based on the url you see on the Phyphox app on your phone. Add/omit the ":8080" bit at the end based on your operating system (Omit if Mac, add if Windows). Start whistling or making high pitch noises to your phone, and you should observe the light change brightness according to the sound it picked up from you. Off when low-pitch or no sound, on when high-pitch or whistling.
