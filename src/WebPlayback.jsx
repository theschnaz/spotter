import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";

const axios = require("axios").default;
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWAqcLWbwvm0585pvx6a46ldqN-q0qJ9A",
  authDomain: "spotter-33098.firebaseapp.com",
  projectId: "spotter-33098",
  storageBucket: "spotter-33098.appspot.com",
  messagingSenderId: "1085573493038",
  appId: "1:1085573493038:web:67607d29799e24c981cabf",
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

const addToQueue = async (token, song) => {
  try {
    const response = await axios.post(
      "https://api.spotify.com/v1/me/player/queue",
      "",
      {
        params: {
          uri: "spotify:track:" + song,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    alert("Song added to your Spotify queue!");
  } catch (error) {
    console.log(error);
  }
};

const getCurrentUser = async (token) => {
  let localUser = [];
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      params: {},
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    console.log("display_name = ", response.data.display_name);
    console.log("externalURL = ", response.data.external_urls.spotify);
    localUser = response.data;
  } catch (error) {
    console.log(error);
  }

  return localUser;
};

const addLikedTracks = async (token, localUser) => {
  console.log("top of liked tracks, user = ", localUser);

  //get all tracks
  const querySnapshot = await getDocs(collection(db, "songs"));
  let addTrackIds = [];
  let localSongs = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log("doc.data", " => ", doc.data());
    addTrackIds.push(doc.data().track.id);
    localSongs.push(doc.data());
  });

  //console.log("tracks arrary ", addTrackIds);

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/tracks", {
      params: {
        market: "US",
        limit: "10",
        offset: "0",
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
      let addTrack = false;
      response.data.items.forEach((item) => {
        if (!addTrackIds.includes(response.data.items[i].track.id)) {
          //add the track if it is not in database; not already liked
          var data = response.data.items[i];
          data.liked_by = localUser.display_name;
          data.liked_by_url = localUser.external_urls.spotify;
          const docRef = addDoc(
            collection(db, "songs"),
            response.data.items[i]
          );
          localSongs.push(response.data.items[i]);
        }
        i = i + 1;
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  } catch (error) {
    console.log(error);
  }

  return localSongs.sort((x, y) => {
    return new Date(x.added_at) < new Date(y.added_at) ? 1 : -1;
  });
};

function WebPlayback(props) {
  //console.log("WebPlayBack props", props);
  console.log("props token", props.token);

  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [player, setPlayer] = useState(undefined);
  const [current_track, setTrack] = useState(track);
  const [songs, setSongs] = useState([]);

  useEffect(async () => {
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

    console.log("before localUser");
    const localUser = await getCurrentUser(props.token);
    const localSongs = await addLikedTracks(props.token, localUser);
    console.log("localSongs = ", localSongs);
    setSongs(localSongs);
  }, []);

  if (!is_active) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>Go to your Spotify app and enable Spotter.</b>
          </div>
          <br />
          <div className="main-wrapper">
            <b>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/perfect-day-19585.appspot.com/o/website%2Fspotter.png?alt=media&token=588f0699-4e48-472c-9e5a-4a0a5a88b520"
                width="500px"
              />
            </b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container" style={{ paddingBottom: 20 }}>
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
          </div>
        </div>
        {songs.map((song, index) => {
          return (
            <div key={index} style={{ paddingTop: 5, paddingLeft: 20 }}>
              <h4>
                <a
                  href={song.track.external_urls.spotify}
                  style={{ color: "white" }}
                  target="_blank"
                >
                  {song.track.name}
                </a>
              </h4>
              <p>{song.track.artists[0].name}</p>
              <button
                style={{marginTop:5}}
                className="btn-spotify"
                onClick={() => {
                  addToQueue(props.token, song.track.id);
                }}
              >
                Add to Queue
              </button>
              <br />
              <div style={{fontSize: 12, paddingBottom: 25, paddingTop:10}}>
                (First liked by{" "}
                <a href={song.liked_by_url} target="_blank" style={{ color: "white" }}>
                  {song.liked_by}
                </a>
                )
              </div>
              <hr />

              <br />
            </div>
          );
        })}
      </>
    );
  }
}

export default WebPlayback;
