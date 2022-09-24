import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import firebaseClient from "firebase/client";

const initialState = {
  data: {},
  isLoaded: false,
  hasErrors: false,
  //add error?
};

const customer = createSlice({
  name: "customer",
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

export const reducer = customer.reducer;

export const { getData, getDataSuccess, getDataFailure, createDataFailure } =
  customer.actions;

export const fetchAllCustomers = createAsyncThunk(
  "customer/fetchAllCustomers",
  async (_, thunkAPI) => {
    // Set the loading state to true
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchAllCustomersFromDb();
      thunkAPI.dispatch(getDataSuccess(data));
    } catch (error) {
      console.error("error", error);
      // Set any erros while trying to fetch
      thunkAPI.dispatch(getDataFailure(error));
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (payload, thunkAPI) => {
    try {
      await _createCustomer(
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.phone,
        payload.customer_id,
        payload.setup_secret
      );
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(createDataFailure());
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (payload, thunkAPI) => {
    try {
      await _updateCustomer(
        payload.docID,
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.phone
      );
    } catch (error) {
      console.error("error", error);
      thunkAPI.dispatch(createDataFailure());
    }
  }
);

async function _fetchAllCustomersFromDb() {
  const snapshot = await firebaseClient
    .firestore()
    .collection("stripe_customers")
    .get();

  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return data;
}

async function _createCustomer(
  firstName,
  lastName,
  email,
  phone,
  customer_id,
  setup_secret
) {
  const doc = await firebaseClient
    .firestore()
    .collection("stripe_customers")
    .add({ firstName, lastName, email, phone, customer_id, setup_secret });

  return doc;
}

async function _updateCustomer(docID, firstName, lastName, email, phone) {
  const doc = await firebaseClient
    .firestore()
    .collection("stripe_customers")
    .doc(docID)
    .update({ firstName, lastName, email, phone });

  return doc;
}
