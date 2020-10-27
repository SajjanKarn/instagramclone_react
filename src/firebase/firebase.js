import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBQzht-N63eTqQpyXJIl5UJH2JcUZCT2BY",
  authDomain: "instagram-clone-react-a9cbc.firebaseapp.com",
  databaseURL: "https://instagram-clone-react-a9cbc.firebaseio.com",
  projectId: "instagram-clone-react-a9cbc",
  storageBucket: "instagram-clone-react-a9cbc.appspot.com",
  messagingSenderId: "10982347588",
  appId: "1:10982347588:web:f568bb7b56b14094107d11",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
