import React, { useState } from "react";

function Login() {
  const [totalDays, setTotalDays] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <a className="btn-spotify" href="https://us-central1-spotter-33098.cloudfunctions.net/app/auth/login">
          Login with Spotify
        </a>
      </header>
      <header className="App-header">
        state = {totalDays}
        <br />
        <span
          onClick={() => {
            setTotalDays(totalDays + 1);
          }}
        >
          increase states
        </span>
      </header>
    </div>
  );
}

export default Login;
