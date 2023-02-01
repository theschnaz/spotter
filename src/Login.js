import React from "react";

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <div style={{ padding: 20 }}>
          <h3>Spotter</h3>
          <p>
            Music people already like
          </p>
        </div>
        <a
          className="btn-spotify"
          href="https://us-central1-spotter-33098.cloudfunctions.net/app/auth/login"
        >
          Login with Spotify
        </a>
      </header>
    </div>
  );
}

export default Login;
