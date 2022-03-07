const redirect_uri = "http://127.0.0.1:5501/dashboard.html";
let client_id = "";
let client_secret = "";

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token"


//Gets called during handleAuthorizationResponse
function onPageLoad(){
  client_id = localStorage.getItem("client_id");
  client_secret = localStorage.getItem("client_secret");
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
  callAuthorizationApi();

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
    refreshName(access_token);
    
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
  //IN REAL APP YOU SHOULD NOT EXPOSE THE CLIENT SECRET! FIND A WAY TO HIDE THIS!!!
  localStorage.setItem("client_secret", client_secret)

  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialogue=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private"
  window.location.href = url;//Show Spotify's authorization screen.
}

function refreshName(access_token){
  const configObj = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    }
  }

  fetch("https://api.spotify.com/v1/me", configObj)
  .then(res => res.json())
  .then(data => handleUserInterface(data))

  // fetch("https://api.spotify.com/v1/me", configObj)
  // .then(res => {
  //   if(res.status === 200){
  //     res.json();
  //   }else if(res.status === 401){
  //     refreshAccessToken();
  //   }else{
  //     console.log(res.responseText);
  //     alert(res.responseText);
  //   }
  // })
  // .then(data => handleUserInterface(data));
}

function handleUserInterface(data){
  console.log(data);
  const dashboard = document.getElementById("dashboard");
  const userLabel = document.getElementById("user-name");
  const userImg = document.getElementById("user-pic");
 
  userLabel.innerText = `${data.display_name}`
  userImg.src = `${data.images[0].url}`

  //Erase the entry for Client ID and User ID


  //TO DO: Handle cases if the access token has expired, then refresh the acces token 
}
//Once we are redirected to the Spotify authentication page and we click "Accept", the new URL includes the code that will be used for the next step

// "http://127.0.0.1:5501/index.html?code="

// let code = "AQBzKbNiyxWlTt0Mh6YsuHvU3C4Q3iyqz-ITB3F1idxNpsK-CXzftsGgl03K5V8vjofmsA3RPYrVcikyDtoW0ZsSf0zBrOeLLMzzyLXB_05ObmG9GfNXLtGQ7SuTUMBTNphuAUo634-nSuoKTumZJ72eHcjGxDSY3y5UbI9HAmKizZN7kon4EDWwKQMMSmWZs-1PkFwEnK9-reU4XUFvSagYPSU7CKf4Ta4eh--Lr1bp5YoiqCZIQwVuwrPgGQcQdc0khlikpY5ABNQ2z2JYpB7Egp1ZgTI8E0lPjrGbEA2E40j_FbsARcCe9SeuPFf9ge43L82IERJV_jpQcaV5Tt0RHAdPznbpiEVaY1ZPPYk2ivePSqF81sk407odY6KuNUatY24w8Q7oPOlKh3985UEmkLgIKC6xqEeXrp3F_T7eyOimeWAV2MmrbA"
