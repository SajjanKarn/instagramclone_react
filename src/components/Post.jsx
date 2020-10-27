import React, { useState, useEffect } from "react";
import "../Styles/Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "../firebase/firebase";
import { Button } from "@material-ui/core";
import firebase from "firebase";
import makeToast from "./Toaster";
import DeleteIcon from '@material-ui/icons/Delete';

function Post({
  username,
  user,
  likes,
  id,
  profileImageURL,
  postImageURL,
  caption,
}) {
  const [comments, setComments] = useState([]);
  const [userComment, setUserComment] = useState("");

  // useEffect for comment Adding listening
  useEffect(() => {
    let unSubscribe;
    if (id) {
      unSubscribe = db
        .collection("posts")
        .doc(id)
        .collection("comments")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapShot) => {
          setComments(
            snapShot.docs.map((comment) => {
              return {
                ...comment.data(),
                id: comment.id,
              };
            })
          );
        });
    }
    // return the unSubscribe to prevent spamming
    return () => {
      unSubscribe();
    };
  }, [id]);

  // handleAddComment
  const handleAddComment = (event) => {
    event.preventDefault();
    // logics here....
    if (!userComment) {
      makeToast("error", "Please enter some texts to add comment!");
      return;
    }
    db.collection("posts")
      .doc(id)
      .collection("comments")
      .add({
        comment: userComment,
        username: user,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((done) => {
        makeToast("success", "Posted Comment!");
        setUserComment("");
      });
  };

  // handlePostDelete
  const handlePostDelete = (postId) => {
    db.collection("posts")
      .doc(postId)
      .delete()
      .then(() => {
        makeToast("success", "Post Deleted!");
      })
      .catch((err) => console.log(err));
  };

  // handleDeleteComment
  const handleDeleteComment = (commentID) => {
    db.collection("posts")
      .doc(id)
      .collection("comments")
      .doc(commentID)
      .delete()
      .then(() => {
        makeToast("success", "Deleted Comment!");
      });
  };

  const handleDeleteCommentSection = (
    user,
    username,
    commentUsername,
    commentId
  ) => {
    if (user === username) {
      return (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleDeleteComment(commentId)}
        >
          <DeleteIcon color="white" fontSize="10px" />
        </Button>
      );
    } else if (user === commentUsername) {
      return (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleDeleteComment(commentId)}
        >
          <DeleteIcon color="white" fontSize="10px" />
        </Button>
      );
    }
  };

  return (
    <div className="post__main">
      <div className="avatar__collection">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Avatar alt={username} src="/broken-image.jpg" />
          <p>{username}</p>
        </div>
        {user === username && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handlePostDelete(id)}
          >
            <DeleteIcon color="white" fontSize="10px" />
          </Button>
        )}
      </div>
      <img alt="post__pic" src={postImageURL} className="post__image" />
      {/* <div className="likes__container">
        <i
          onClick={handleLikeChange}
          className={postLike > 0 ? heartClassName : (heartClassName += "-o")}
          aria-hidden="true"
        ></i>
        <p>{likes} likes</p>
      </div> */}
      <div className="caption__container">
        <p>
          <strong>{username}</strong>: {caption}
        </p>
      </div>
      <div className="all_comments">
        <h3>Comments</h3>
        {comments.length <= 0 && <p>No comments in this Post!</p>}
        {comments.map((comment) => {
          return (
            <p
              key={comment.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p>
                <strong>@{comment.username}</strong>: {comment.comment}
              </p>

              {handleDeleteCommentSection(
                user,
                username,
                comment.username,
                comment.id
              )}
            </p>
          );
        })}
      </div>
      {!user ? (
        <h4 style={{ textAlign: "center" }}>Login in order to add comments!</h4>
      ) : (
        <form className="form_comments">
          <input
            type="text"
            placeholder="Add a Comment..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
          />
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            onClick={handleAddComment}
            className="button_add_comment"
          >
            Add
          </Button>
        </form>
      )}
    </div>
  );
}

export default Post;
