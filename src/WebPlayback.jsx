import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";

const axios = require("axios").default;
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOf8EL0mCIS89vymdsRsjq0-KHJdXDTW0",
  authDomain: "musalives.firebaseapp.com",
  projectId: "musalives",
  storageBucket: "musalives.appspot.com",
  messagingSenderId: "353183638905",
  appId: "1:353183638905:web:5e3f21c2a9c0bc7978bba8",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

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

const addLikedTracks = async (token) => {
  //get all tracks
  const querySnapshot = await getDocs(collection(db, "songs"));
  let addTrackIds = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log("doc.data().track.id", " => ", doc.data().track.id);
    addTrackIds.push(doc.data().track.id);
  });

  console.log("tracks arrary ", addTrackIds)

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/tracks", {
      params: {
        market: "ES",
        limit: "10",
        offset: "5",
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    console.log("liked response", response.data.items);

    try {
      let i = 0;
      response.data.items.forEach((item) => {
        //const docRef = addDoc(collection(db, "songs"), response.data.items[i]);
        i = i + 1;
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  } catch (error) {
    console.log(error);
  }
};

function WebPlayback(props) {
  //console.log("WebPlayBack props", props);
  console.log("props token", props.token);

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
            <br />
            <button
              className="btn-spotify"
              onClick={() => {
                addLikedTracks(props.token);
              }}
            >
              get liked tracks
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default WebPlayback;
