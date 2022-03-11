//VARIABLES
const trackList = document.querySelector('#track-list');
const addToPlaylistBtn = document.querySelector('#playlist-adder');
const playlistContainer = document.getElementById("playlist-container");
const currentPlaylistName = document.getElementById('playlist-name');
const currentPlaylistImg = document.getElementById('playlist-img');
const randomSongBtn = document.querySelector('#randomize');
const currentTrackMetadata = document.querySelector("#current-track-metadata");
const playPauseBtn = document.querySelector("#play-pause");
const albumCover = document.querySelector("#album-cover");

//Variables Needed for API Authorization
const redirect_uri = "http://127.0.0.1:5501/dashboard.html";
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";

//Client ID and Client Secret Will Be Taken From the Form in the Index.html File
let client_id = "";
let client_secret = "";


//On page load, stores the client id and client secret so we can use it later on
function onPageLoad(){
  client_id = localStorage.getItem("client_id");
  client_secret = localStorage.getItem("client_secret");

  //Retrieve the user data
  fetch("http://localhost:4000/user")
  .then(res => res.json())
  .then(data => handleUserData(data));

  //Once the playlists are refreshed, make another fetch call to use the refreshed playlist data
  fetch("http://localhost:4000/playlists")
  .then(res => res.json())
  .then(data => data[0].items.forEach(displayPlaylist))

  //The window.location.search property is the search (?) part of the url provided to the browser
  //We are telling the browser to check whether we are making a new http request
  if (window.location.search.length > 0){
    handleRedirect();
  }
};

function handleRedirect(){
  let code = getCode();
  fetchAccessToken( code ); 
  window.history.pushState("", "", redirect_uri)//remove the param from url
}

function fetchAccessToken(code){
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret))
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function refreshAccessToken(){
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant-type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthorizationApi(body);
}

function handleAuthorizationResponse(){
  if (this.status == 200){
    var data = JSON.parse(this.responseText);
    console.log(data);
    var data = JSON.parse(this.responseText);
    if(data.access_token != undefined){
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
    }
    if(data.refresh_token != undefined){
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    onPageLoad();
    accessDashboard(access_token);
    
  }else{
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function getCode(){
  let code = null;
  const queryString = window.location.search;

  if(queryString.length > 0){
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get('code');
  }
  return code;
}

//This is the function that will redirect us to the Spotify login 
//It takes the client ID and client secret for authorization
function requestAuthorization(){
  client_id = document.getElementById("clientId").value
  client_secret = document.getElementById("clientSecret").value
  localStorage.setItem("client_id", client_id)
  //IN REAL APP YOU SHOULD NOT EXPOSE THE CLIENT SECRET!
  localStorage.setItem("client_secret", client_secret)

  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialogue=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private"
  window.location.href = url;//Show Spotify's authorization screen.
}

function accessDashboard(access_token){
  const configObj = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    }
  }
  //Make a GET request to the Spotify API to get user data
  fetch("https://api.spotify.com/v1/me", configObj)
  .then(res => res.json())
  .then(data => handleUserInterface(data))

  //Make a Get request to the Spotify API to get playlists
  fetch("https://api.spotify.com/v1/me/playlists", configObj)
  .then(res=> res.json())
  .then(data => saveUserPlaylists(data));

}

function saveUserPlaylists(playlistData){
  //This returns an array of objects with info for each playlist
  console.log(playlistData); 

  //Make a PATCH call to refresh the database with all current playlists
  let playlistsData = {
    "total": playlistData.total,
    "items": playlistData.items
  }
  let playlistConfigObj = {
    method: "PATCH", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(playlistsData)
  }
  fetch("http://localhost:4000/playlists/1", playlistConfigObj);

}

function displayPlaylist(playlist){

  //Create card for the playlist
  
  let playlistCard = document.createElement("div");
  playlistCard.className = "playlist-card";
  playlistCard.style.height = "300px";
  playlistCard.style.width = "300px";
  playlistCard.style.backgroundColor = "lightgray";
  playlistCard.style.backgroundImage = `url(${playlist.images[0].url})`;
  playlistCard.style.backgroundSize = "300px 300px";

  let playlistName = document.createElement("h2");
  playlistName.className = "playlist-lbl"
  playlistName.innerText = playlist.name;
  playlistCard.append(playlistName);
  // playlistCard.id = playlist.
  playlistContainer.append(playlistCard);

  //When we click on a playlist image, it gets displayed on the Currently Selected Playlist container
  playlistCard.addEventListener("click", () => {
    access_token = localStorage.getItem("access_token")
    console.log(playlist)
    const configObj = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      }
    }
    //TO DO: NEEDS ACCESS TOKEN REFRESH HANDLING
    fetch(`${playlist.tracks.href}`, configObj)
    .then( res => res.json())
    .then( data => {
      renderPlaylistTracks(data.items)
    }
      )
    // console.log('This is the chosen playlist:', playlist.id);
    //Display the selected playlist name and image on the current playlist container
    currentPlaylistName.innerText = "";
    currentPlaylistName.innerText = playlist.name;
    currentPlaylistImg.src = playlist.images[0].url;
    currentPlaylistImg.value = playlist.id;
    currentPlaylistImg.style.border = "solid black 4px"
  })



}

function savePlaylistTracks(songItem){
console.log(songItem.track)
access_token = localStorage.getItem("access_token")
let trackData = {
  "name": songItem.track.name,
  "artists": songItem.track.artists[0].name,
  "album": songItem.track.album.name,
  "uri": songItem.track.uri,
  "href": songItem.track.href
 }

fetch(`http://localhost:4000/current_playlist/`, {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + access_token
    },
    body: JSON.stringify(trackData)
})

console.log(trackData)
}

function renderPlaylistTracks(songInfo){
  //Makes sure to empty the list of tracks so they don't accumulate
  console.log(songInfo)
  trackList.innerHTML = "";
  songInfo.forEach(listTracks)
}


function listTracks(trackInfo){
  
  let track = trackInfo.track
  addTrackToPlayListContainer(track);
  // currentPlaylistName.innerText =
}

function addTrackToPlayListContainer(track){
  const trackContainer = document.createElement('li');
  const trackArtist = document.createElement('strong');
  trackContainer.className = "playlist-item";
  trackArtist.innerText = ` - ${track.artists[0].name}`;
  trackContainer.innerText = track.name;
  trackContainer.append(trackArtist);
  trackList.append(trackContainer);
  //Create an event listener for the list items. When clicked, play the track.
  trackContainer.addEventListener('click', e => playTrack(track))
}

function playTrack(track){
  playPauseBtn.className = "player-btn btn btn-outline-primary paused";
  playPauseBtn.textContent = "||";
  console.log("This is the track", track);
  //Get a list of devices
  access_token = localStorage.getItem("access_token")
  const deviceConfigObj = {
    method: "GET", 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    }
  }
  //FETCH CALL TO GET & ACTIVATE DEVICES - REQUIRED TO PLAY FROM THE DEVICE
  fetch("https://api.spotify.com/v1/me/player/devices", deviceConfigObj)
  .then(res => res.json())
  .then(data => setActiveDevice(data, track))
}

function setActiveDevice(deviceData, track){
  //If there are any active devices, play from the active device. If none are active, play from the computer. If there are no computer devices, choose the first device and let the user know which device is being targeted.
  for (let i = 0; i < deviceData.devices.length; i++){
      console.log(deviceData.devices[i]);
      let device = deviceData.devices[i]

  //Only computers are supported device 
      if(device.type === "Computer"){
        //Activate Device
        device.is_active = true;
        console.log("Device is Active. Play from this device: ", device, track.uri);
        //Make our Play Song Fetch call
        const trackConfigObj = {
          method: "PUT", 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
          },
          body: JSON.stringify({"uris": [track.uri]})
        }
        //Play the Song
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device.id}`, trackConfigObj);
          displaySongInfo(track) //displays track on currently playing container
        break;
      }else{
        alert("Uh oh. Seems like you don't have a computer device to play from...")
      }
  }
}

function handleUserData(data){
  const userLabel = document.getElementById("user-name");
  const userImg = document.getElementById("user-pic");
  // console.log(data);
  userLabel.innerText = `${data[0].name}!`;
  userImg.src = data[0].profile_img;
}

function handleUserInterface(data){
  console.log(data);

  //We want to save this data into our fake database on JSON server so the data persists
  userData = {
    "name": data.display_name,
    "profile_img": data.images[0].url
  }
  let userConfigObj = {
    method: "PATCH", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData)
  }
  
  //Make a PATCH call to the JSON server to patch the user data we received from Spotify.
  fetch("http://localhost:4000/user/1", userConfigObj)
}

//RANDOM SONG BUTTON
randomSongBtn.addEventListener('click', () => { // adds event listener on song button
    fetchRandomSong();
})

function fetchRandomSong(){ //function that grabs a 'random' song
  access_token = localStorage.getItem("access_token")
  const configObj = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    }
  }
  
  const chars = 'abcdefghijklmnopqrstuvwxyz'; // establishes alphabet string to pull random character for search query
  const randChar = chars.charAt(Math.floor(Math.random() * chars.length))

  //Retrieve a random song from the Spotify API
  fetch(`https://api.spotify.com/v1/search?q=%25${randChar}%25&type=track&offset=${Math.floor(Math.random() * 1000)}`, configObj) // searches for song with random character as search query, picks 20 tracks  from results
  .then( res => res.json())
  .then( data => {
    const randomSong = data.tracks.items[Math.floor(Math.random() * 20)]
    saveSong(randomSong);
    })
}

function saveSong(randomSong){ // saves data from our randomly generated song to the db.json file
  console.log('This is the random song:', randomSong);
 
  let trackData = {
     "id": 1,
     "name": randomSong.name,
     "artists": randomSong.artists,
     "album": randomSong.album,
     "uri": randomSong.uri,
     "href": randomSong.href
    }
  trackDataConfigObj = {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
        },
    body: JSON.stringify(trackData)
    }   
  
  //Make a fetch PATCH request to the database to save the random song
  fetch(`http://localhost:4000/random_track/1`, trackDataConfigObj)
  .then(res => res.json())
  .then(data => {fetchDBRandomSong(data)});
};

function fetchDBRandomSong(data){
   //  Fetch the random song from the JSON DB
   fetch(`http://localhost:4000/random_track/1`)
   .then( res => res.json())
   .then( data => {
     displaySongInfo(data);
     playTrack(data);
   });
};



function displaySongInfo(track){

  albumCover.innerHTML = '';
  const trackTitle = document.querySelector(".track-title")
  trackTitle.textContent = "Track: " + track.name;
  const artistName = document.querySelector(".artist-name")
  artistName.textContent = "Artist: " + track.artists[0].name;
  const albumName = document.querySelector(".album-name");
  albumName.textContent = "Album: " + track.album.name;

  const coverArt = document.createElement('img');

  coverArt.id = "cover-art"
  coverArt.src = track.album.images[1].url
  console.log(coverArt)
  albumCover.append(coverArt)
}
//Add to playlist button
addToPlaylistBtn.addEventListener("click", () =>{
  
  let playlistId = currentPlaylistImg.value;
  console.log(playlistId);

  //Make a fetch GET call to add the random song to the playlist
  fetch(`http://localhost:4000/random_track/1`)
  .then( res => res.json())
  .then( data => {
    addSongToPlaylist(data, playlistId);
  })
})

function addSongToPlaylist(song, playlistId){
    //If track ID in currently playing box AND selected playlist contains song with same ID, then alert user
    // if(trackList.innerHTML === "" || song.uri === playlistId){
    if(trackList.innerHTML === ""){
      alert("Please select a playlist.")
    }else{
      //Add song to playlist
      access_token = localStorage.getItem("access_token")
      const addSongObject = {
        "uris": [song.uri],
        "position": 0
      }
      const addSongConfigObj = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + access_token,
          Accept: 'application/json'
        },
        body: JSON.stringify(addSongObject)
      }

      //Make a POST fetch call to add song to playlist;
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, addSongConfigObj);

      addTrackToPlayListContainer(song);
    }
    //  const artist = document.createElement('strong');
    //  artist.innerText = ` - ${song.artists[0].name}`;
    //  const li = document.createElement('li');
    //  li.textContent = song.name;
    //  li.append(artist);
    //   li.className = "playlist-item";
    //  li.addEventListener('click', () => playTrack(song));
    //  trackList.append(li);
}

playPauseBtn.addEventListener('click', () => {
  access_token = localStorage.getItem("access_token")

  if (playPauseBtn.className === "player-btn btn btn-outline-primary paused"){

    fetch(`https://api.spotify.com/v1/me/player/pause`, {
     method: "PUT",
     headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token,
         Accept: 'application/json'
     }
 })
    playPauseBtn.textContent = "▶︎"
    playPauseBtn.className = "player-btn btn btn-outline-primary play";
}

  else if (playPauseBtn.className === "player-btn btn btn-outline-primary play"){
    fetch(`https://api.spotify.com/v1/me/player/play`, {
     method: "PUT",
     headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token,
         Accept: 'application/json'
        }
      })
      playPauseBtn.textContent = "||"
    playPauseBtn.className = "player-btn btn btn-outline-primary paused";
    }
  }
)

