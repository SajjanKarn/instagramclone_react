import React, { useState } from "react";
import { Input, Button } from "@material-ui/core";
import { storage, db } from "../firebase/firebase";
import makeToast from "./Toaster";
import firebase from "firebase";
import "../Styles/ImageUploader.css";

function ImageUpload({ username }) {
  // hooks
  const [caption, setCaption] = useState("");
  const [image, SetImage] = useState(null);
  const [progress, setProgess] = useState(0);

  // handleFileChange
  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      SetImage(event.target.files[0]);
    }
  };

  // handleOnUpload
  const handleUpload = (event) => {
    if (!image || !caption) {
      makeToast("error", "Please choose both fields!");
      return;
    }
    // if atleast one of the fields are available continue the code..

    const uploadWork = storage.ref(`images/${image.name}`).put(image);

    uploadWork.on(
      "state_changed",
      (snapShot) => {
        const progress = Math.round(
          (snapShot.bytesTransferred / snapShot.totalBytes) * 100
        );
        // setTheProges according to the image bytes transferred
        setProgess(progress);
      },
      (err) => {
        alert(err);
        makeToast("error", err.message);
      },
      // if there were no error then let's upload the post
      () => {
        storage
          .ref("images")
          .child(image.name) // get the image download url according to the name
          .getDownloadURL()
          .then((url) => {
            // now we have the URL let's make the post...
            db.collection("posts")
              .add({
                username,
                postImageURL: url,
                caption,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then((done) => {
                db.collection(`posts`)
                  .doc(`${done.id}`)
                  .set({ likes: 0 }, { merge: true })
                  .catch((err) => console.log(err.message));
                setProgess(0);
                setCaption("");
                SetImage(null);
                makeToast("success", "Posted Successfully!");
              })
              .catch((err) => {
                makeToast("error", err.message);
                console.log(err);
              });
            // we need also set Likes
            // db.collection();

            // once everything is done
          });
      }
    );
  };

  return (
    <div className="img_uploader">
      <div className="img_components">
        <progress value={progress} max={100} />
        <Input
          type="text"
          placeholder="Enter Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <Button variant="contained" color="secondary" onClick={handleUpload}>
          Upload
        </Button>
      </div>
    </div>
  );
}

export default ImageUpload;
