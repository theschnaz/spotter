import React from "react";

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <a className="btn-spotify" href="https://us-central1-spotter-33098.cloudfunctions.net/app/auth/login">
          Login with Spotify
        </a>
      </header>
    </div>
  );
}

export default Login;
