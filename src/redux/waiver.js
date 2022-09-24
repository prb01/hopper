import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firebaseClient from "firebase/client";

const initialState = {
  data: [],
  isLoaded: false,
  hasErrors: false,
  errorMsg: {},
};

const waiver = createSlice({
  name: "waiver",
  initialState,
  reducers: {
    getData: (state) => {},

    getDataSuccess: (state, action) => {
      state.isLoaded = true;
      state.data = action.payload;
    },

    getDataFailure: (state, action) => {
      state.isLoaded = true;
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },

    createDataFailure: (state, action) => {
      state.hasErrors = true;
      state.errorMsg = action.payload;
    },
  },
});

export const reducer = waiver.reducer;

export const { getData, getDataSuccess, getDataFailure, createDataFailure } = waiver.actions;

export const fetchWaiverById = createAsyncThunk(
  "waiver/fetchWaiverById",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchWaiverByIdFromDb(payload.id);
      thunkAPI.dispatch(getDataSuccess(data));
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(getDataFailure(error));
    }
  }
);

export const fetchWaiversByBookingId = createAsyncThunk(
  "waiver/fetchWaiversByBookingId",
  async (payload, thunkAPI) => {
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchWaiversByBookingIdFromDb(payload.id);
      thunkAPI.dispatch(getDataSuccess(data));
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(getDataFailure(error));
    }
  }
);

export const createWaiver = createAsyncThunk(
  "waiver/createWaiver",
  async (payload, thunkAPI) => {
    try {
      await _createWaiver(payload.name, payload.bookingId);
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(createDataFailure());
    }
  }
);

export const updateWaiver = createAsyncThunk(
  "waiver/updateWaiver",
  async (payload, thunkAPI) => {
    try {
      await _updateWaiver(
        payload.id,
        payload.fullName,
        payload.guardian,
        payload.email,
        payload.date,
        payload.ipAddress,
        payload.userAgent,
        payload.submitted,
        payload.waiverURL
      );
      thunkAPI.dispatch(getDataSuccess(payload));
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(createDataFailure());
    }
  }
);

export const saveFile = createAsyncThunk("waiver/saveFile", async (payload) => {
  const file = payload.file;

  try {
    const fileName = _appendToFilename(file.name, "_" + Date.now());
    const uploadTask = _uploadFile(fileName, file);

    const uploadPromise = new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("progress:", progress);
        },
        (error) => {
          reject(error);
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then((downloadURL) => resolve(downloadURL))
            .catch(reject);
        }
      );
    });

    const downloadURL = await uploadPromise;

    return downloadURL;
  } catch (error) {
    alert("Error saving file: " + JSON.stringify(error));
  }
});

function _appendToFilename(filename, string) {
  var dotIndex = filename.lastIndexOf(".");
  if (dotIndex == -1) return filename + string;
  else return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}

function _uploadFile(fileName, file) {
  const uploadTask = firebaseClient.storage().ref(`/${fileName}`).put(file);

  return uploadTask;
}

async function _fetchWaiverByIdFromDb(id) {
  const snapshot = await firebaseClient.firestore().collection("waivers").doc(id).get();

  const waiverData = snapshot ? { id: snapshot.id, ...snapshot.data() } : null;

  return waiverData;
}

async function _fetchWaiversByBookingIdFromDb(bookingId) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("waivers")
    .where("bookingId", "==", bookingId)
    .get();

  const waiverData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return waiverData;
}

async function _createWaiver(name, bookingId) {
  const doc = await firebaseClient.firestore().collection("waivers").add({
    name,
    bookingId,
  });
  return doc;
}

async function _updateWaiver(
  id,
  fullName,
  guardian,
  email,
  date,
  ipAddress,
  userAgent,
  submitted,
  waiverURL
) {
  const doc = await firebaseClient.firestore().collection("waivers").doc(id).update({
    fullName,
    guardian,
    email,
    date,
    ipAddress,
    userAgent,
    submitted,
    waiverURL,
  });

  return doc;
}
