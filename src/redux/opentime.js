import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firebaseClient from "firebase/client";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  //add error?
};

const opentime = createSlice({
  name: "opentime",
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
    },

    createDataFailure: (state) => {
      state.hasErrors = true;
      //add errors?
    },
  },
});

export const reducer = opentime.reducer;

export const { getData, getDataSuccess, getDataFailure, createDataFailure } =
  opentime.actions;

export const fetchOpenTimes = createAsyncThunk(
  "opentime/fetchOpenTimes",
  async (_, thunkAPI) => {
    // Set the loading state to true
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchOpenTimesFromDb();
      thunkAPI.dispatch(getDataSuccess(data));
    } catch (error) {
      console.error("error", error);
      // Set any erros while trying to fetch
      thunkAPI.dispatch(getDataFailure(error));
    }
  }
);

export const createOpenTime = createAsyncThunk(
  "opentime/createOpenTime",
  async (payload, thunkAPI) => {
    try {
      await _createOpenTime(payload.date, payload.open, payload.close);
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(createDataFailure());
    }
  }
);

async function _fetchOpenTimesFromDb() {
  const snapshot = await firebaseClient
    .firestore()
    .collection("opentime")
    .get();

  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return data;
}

async function _createOpenTime(date, open, close) {
  const doc = await firebaseClient
    .firestore()
    .collection("opentime")
    .add({ date, open, close });

  return doc;
}

//test function
export const fetchTime = createAsyncThunk(
  "time/fetchTime",
  async (_, thunkAPI) => {
    // Set the loading state to true
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchTimeFromDb();
      thunkAPI.dispatch(getDataSuccess(data));
    } catch (error) {
      console.error("error", error);
      // Set any erros while trying to fetch
      thunkAPI.dispatch(getDataFailure(error));
    }
  }
);


async function _fetchTimeFromDb() {
  const snapshot = await firebaseClient
    .firestore()
    .collection("opentime")
    .get();

  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return data;
}