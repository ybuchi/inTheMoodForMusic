fetch("https://api.spotify.com")
.then(res => res.json())
.then(data => console.log(data));