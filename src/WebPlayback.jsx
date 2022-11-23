import React, { useState, useEffect } from "react";

const axios = require("axios").default;

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

const addToQueue = async () => {
  try {
    const response = await axios.post(
      "https://api.spotify.com/v1/me/player/queue",
      "",
      {
        params: {
          uri: "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            "Bearer BQC5aat7-KV_0T1kdeod59cmKdvcRGS-Ko8RyI2HppLqCKQ3F-v3hhxp1db7OHLJ0O1yhbSi89U8QyfuC6td6ThyWHoIYPKduEQTMSXMw39Ll-rGdp411WvldT7rgeeFysX3XJmN1Nl4zvoHJq9nYvCLj5laCel-GwHoFKVRrWU3SqAndQ",
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

function WebPlayback(props) {
  console.log("WebPlayBack props", props);

  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [player, setPlayer] = useState(undefined);
  const [current_track, setTrack] = useState(track);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Spotter",
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect();
    };
  }, []);

  if (!is_active) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>
              {" "}
              Instance not active. Transfer your playback using your Spotify app{" "}
            </b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <img
              src={current_track.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />

            <div className="now-playing__side">
              <div className="now-playing__name">{current_track.name}</div>
              <div className="now-playing__artist">
                {current_track.artists[0].name}
              </div>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.previousTrack();
                }}
              >
                &lt;&lt;
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.togglePlay();
                }}
              >
                {is_paused ? "PLAY" : "PAUSE"}
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.nextTrack();
                }}
              >
                &gt;&gt;
              </button>
            </div>
            <button
              className="btn-spotify"
              onClick={() => {
                addToQueue();
              }}
            >
              Add songs to queue
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default WebPlayback;
