import React, { useState, useEffect } from "react";
import WebPlayback from "./WebPlayback";
import Login from "./Login";
import "./App.css";

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    async function getToken() {
      const response = await fetch(
        "https://us-central1-spotter-33098.cloudfunctions.net/app/auth/token"
      );
      const json = await response.json();
      console.log(
        "response from  https://us-central1-spotter-33098.cloudfunctions.net/app/auth/token",
        json.access_token
      );
      setToken(json.access_token);
    }

    getToken();
  }, []);

  return <>{token === "" ? <Login /> : <WebPlayback token={token} />}</>;
}

export default App;
