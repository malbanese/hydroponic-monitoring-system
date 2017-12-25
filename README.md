# Hydroponic Monitoring System.
Simple Node.js server designed to run on a Raspberry PI, monitors a hydroponic growing environment.

# Overview
This was a project that I started developing to bridge a monitoring gap for
my home hydroponic setup. After setting up the base growing environment and
lights, I realized that there was no good way to instantly get all of the
information I needed without manually opening the tent.

To create a remote monitoring system, I used a Raspberry Pi, loaded with sensors
and a camera to provide myself a quick and easy way to monitor my plants :).

Timelapse Video of the image captures:
https://i.imgur.com/VIe4xvk.gif

![Example from camera](https://i.imgur.com/KXxC2ZI.jpg)

![Basil from the timelapse](https://i.imgur.com/QHwr3QJ.jpg)

# Hardware List
- Raspberry Pi, complete with power cable and SD card.
- Raspberry Pi Camera Module V2.
- DHT22 / AM2302 Digital Temperature and Humidity sensor.
- (Future) eTape Liquid Level Sensor and modulation board.

To keep the Raspberry Pi in place, I ended up using a simple cellphone mount
in order to affix it to one of the growing tent's support bars. The Raspberry Pi
camera module and DHT22 sensor were affixed to a small plastic
case, and the mount was adjusted so the plants would be in view of the camera.

# Timelapse Creation
For timelapse creation, I use the following interpolated FFMPEG command:
> ffmpeg -framerate 15 -pattern_type glob -i '*.png' -c:v libx264 -pix_fmt yuv420p -filter "minterpolate='fps=30'" -y timelapse.mp4

For a slightly more configurable timelapse creation, see https://github.com/malbanese/node-cli-timelapse-stitcher

# Starting the server
The server uses NPM as a package manager, so all relevant packages must be
installed on the Raspberry Pi device, by running the npm install command.

The following NPM commands are provided within the package.json

- Start the server in the current terminal shell:
> npm run start
- Start the server using a forever instance:
> npm run fstart
- Stop the server's forever instance:
> npm run fstop

# Server Endpoints
The default port of the server is 8080.

To reduce load on the Raspberry Pi, an image is only captured once every five
minutes. Every hour, the captured image will be saved to the sd card in the
project's bin folder.

/
> Displays the last taken image.

/nextPictureTime
> Returns a json formatted string for when the next picture will be taken.

/brightness
> Captures a new image and measures the brightness.

/refresh
> Updates the current image by taking a new one and refreshing.
