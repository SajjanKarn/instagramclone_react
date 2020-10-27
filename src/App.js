import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Post from "./components/Post";
import { db, auth, storage } from "./firebase/firebase";
import {
  Modal,
  makeStyles,
  Input,
  Button,
  Avatar,
  Link,
} from "@material-ui/core";
import makeToast from "./components/Toaster";
import "./Styles/Navbar.css";
import ImageUpload from "./components/ImageUpload";

function App() {
  const [posts, setPosts] = useState([]);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // usehooks
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // useEffect for authstatechange
  useEffect(() => {
    const unSubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        if (authUser.displayName) {
          // do nothing
          setUser(authUser);
        } else {
          return authUser.updateProfile({ displayName: username });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      unSubscribe();
    };
  }, [user, username]);

  // modal styling
  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const useStyles = makeStyles((theme) => ({
    paper: {
      position: "absolute",
      maxWidth: 400,
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);

  useEffect(() => {
    // set the post to  the state
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => {
            return {
              ...doc.data(),
              id: doc.id,
            };
          })
        );
      });
  }, []);

  // handleRegisterUser
  const handleRegisterUser = (event) => {
    event.preventDefault();

    // create user with email and password
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        makeToast("success", "User Registered Successfully!");
        setEmail("");
        setPassword("");
        setRegisterModalOpen(false);
        alert("Refresh the page to start uploading posts!");
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((err) => {
        makeToast("error", err.message);
      });
  };
  // handleLoginUser
  const handleLoginUser = (event) => {
    event.preventDefault();

    // login user
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        makeToast("success", "Sign In Success!");
      })
      .catch((err) => makeToast("error", err.message));

    setLoginModalOpen(false);
  };

  return (
    <div className="App">
      <div className="navbar__main">
        <img
          alt="instagram_logo"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
          className="insta__logo"
        />
        <div className="user_sigin_stuffs">
          {user ? (
            <div className="logout_styling">
              <Avatar alt={user?.displayName} src="/static/1.jpg" />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  makeToast("success", "Logged Out Successfully!");
                  auth.signOut();
                }}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div>
              {" "}
              <Button
                variant="contained"
                color="secondary"
                style={{ marginRight: "5px" }}
                onClick={() => setRegisterModalOpen(true)}
              >
                Sign Up
              </Button>
              <Button
                variant="contained"
                color="default"
                onClick={() => setLoginModalOpen(true)}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="post_collections">
        {/* RegiserUserModal */}

        {/* conditionally render these buttons */}

        <Modal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
        >
          <div style={modalStyle} className={classes.paper}>
            <form className="form__user">
              <img
                alt="instagram_logo"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
                className="insta__logo"
                style={{ display: "block", margin: "auto", padding: "20px 0" }}
              />
              <Input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                placeholder="Enter Username"
              />
              <Input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Enter Email"
              />
              <Input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Enter Password"
              />
              <Button
                onClick={handleRegisterUser}
                type="submit"
                variant="contained"
                color="secondary"
              >
                Register
              </Button>
            </form>
          </div>
        </Modal>

        {/* LoginUserModal */}
        <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)}>
          <div style={modalStyle} className={classes.paper}>
            <form className="form__user">
              <img
                alt="instagram_logo"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
                className="insta__logo"
                style={{ display: "block", margin: "auto", padding: "20px 0" }}
              />
              <Input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Enter Email"
              />
              <Input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Enter Password"
              />
              <Button
                onClick={handleLoginUser}
                type="submit"
                variant="contained"
                color="secondary"
              >
                Login
              </Button>
            </form>
          </div>
        </Modal>
        {/* Posts */}

        {posts.map((post) => (
          <Post
            key={post.id}
            user={user?.displayName}
            username={post.username}
            likes={post.likes}
            id={post.id}
            caption={post.caption}
            postImageURL={post.postImageURL}
          />
        ))}
      </div>
      <div className="ImageUploader">
        {user?.displayName ? (
          <ImageUpload username={user.displayName} />
        ) : (
          <div>
            <h2 style={{ textAlign: "center" }}>
              You need to be logged in order to make Posts!
            </h2>
            <p style={{ textAlign: "center" }}>
              Website Developed By{" "}
              <Button variant="contained" color="secondary">
                <a
                  style={{ textDecoration: "none", color: "white" }}
                  href="https://instagram.com/sajjan_404"
                  target="_blank"
                >
                  @Sajjan_404
                </a>
              </Button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
