# ChuneItUp
ChuneItUp is an application that lets users curate their digital records (Spotify playlists) in a fun and interesting user interface. 

Looking for some new chunes? Generate a random song, see if it fits in any of the playlists in your library, and then add it with a click of a button. You'll actually see these changes in your Spotify account!

## _Running the Application_

This application is currently in development. It is a prototype that uses the JSON Server npm package, so after installing the packing dependencies, you need to run json server on port 4000 from your terminal:

```json-server -p 4000 db.json```

Once the server is up and running, feed in a client id and client secret which will lead you to Spotify's authentication and terms of service page (this will only happen once). Once you have aunthenticated, you will be redirected to the dashboard.

**Note:** Because we are using json server and not a real database, it is important to always go through the authentication page or else the dashboard will display the last data that was saved in the db.json file. 

## Application Limitations
Using the Spotify API to play music has certain limitations:
1. You can only play a song through the Spotify app to one of the devices you have registered in your Spotify account.
2. For now, our application limits the ability to play a song to a device of type "Computer". 
3. This application will work best for people logging in with a Spotify Premium account. Non-premium members may encounter issues when trying to play tracks.
4.


