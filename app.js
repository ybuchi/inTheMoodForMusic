const redirect_uri = "http://127.0.0.1:5501/public/index.html";
let client_id = "";
let client_secret = "";

const AUTHORIZE = "https://accounts.spotify.com/authorize"

function onPageLoad(){

};

function requestAuthorization(){
  client_id = document.getElementById("clientId").value
  client_secret = document.getElementById("clientSecret").value
  localStorage.setItem("client_id", client_id)
  //IN REAL APP YOU SHOULD NOT EXPOSE THE CLIENT SECRET! FIND A WAY TO HIDE THIS!!!
  localStorage.setItem("client_secret", client_secret)

  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialogue=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state"
  window.location.href = url;//Show Spotify's authorization screen.
}
