# inTheMoodForMusic
Music for the soul baby

inTheMoodForMusic is an application that allows you to generate random songs and easily create new playlists based on you mood and taste. 

## _Resources_

This application prototype uses the JSON Server npm package, so after installing the packing dependencies, you need to run json server on port 4000 from your terminal:

```json-server -p 4000 db.json```

Once the server is up and running, you need to feed in a client id and client secret which will lead you to Spotify's authentication and terms of service page (this will only happen once). Once you have aunthenticated, you will be directed to your dashboard.

**Note:** Because we are using json server and not a real database, it is important to always go through the authentication page or else the dashboard will display the last data that was saved in the db.json file. 


