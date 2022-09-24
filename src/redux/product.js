import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firebaseClient from 'firebase/client';

const initialState = {
  data: [],
  isLoaded: false,
  hasErrors: false,
  errorMsg: {},
};

const product = createSlice({
  name: 'product',
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

export const reducer = product.reducer;

export const { getData, getDataSuccess, getDataFailure, createDataFailure } =
  product.actions;

export const fetchAllProducts = createAsyncThunk(
  'product/fetchAllProducts',
  async (_, thunkAPI) => {
    thunkAPI.dispatch(getData());

    try {
      const data = await _fetchAllProductsFromDb();
      thunkAPI.dispatch(getDataSuccess(data));
    } catch (error) {
      console.error('error', error);
      thunkAPI.dispatch(getDataFailure(error));
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (payload, thunkAPI) => {
    try {
      await _createProduct(
        payload.title,
        payload.desc,
        payload.type,
        payload.price,
        payload.photo,
        payload.status,
        payload.room,
        payload.duration
      );
    } catch (error) {
      console.error('error', error);
      thunkAPI.dispatch(createDataFailure(error));
    }
  }
);

export const savePhoto = createAsyncThunk(
  'product/savePhoto',
  async (payload) => {
    const file = payload.file;

    try {
      const fileName = _appendToFilename(file.name, '_' + Date.now());
      const uploadTask = _uploadFile(fileName, file);

      const uploadPromise = new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('progress:', progress);
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
      alert('Error saving photo: ' + JSON.stringify(error));
    }
  }
);

async function _fetchAllProductsFromDb() {
  const snapshot = await firebaseClient
    .firestore()
    .collection('products')
    .get();

  const roomsData = {};
  const rooms = await firebaseClient.firestore().collection('rooms').get();
  rooms.docs.forEach((doc) => (roomsData[doc.id] = { ...doc.data() }));

  const data = snapshot.docs.map((doc) => {
    const { room, ...rest } = doc.data();

    return {
      id: doc.id,
      ...rest,
      room: roomsData[room] || null,
    };
  });

  return data;
}

async function _createProduct(
  title,
  desc,
  type,
  price,
  photo,
  status,
  room = null,
  duration = null
) {
  const doc = await firebaseClient.firestore().collection('products').add({
    title,
    desc,
    type,
    price,
    photo,
    status,
    room,
    duration,
  });

  return doc;
}

function _appendToFilename(filename, string) {
  var dotIndex = filename.lastIndexOf('.');
  if (dotIndex == -1) return filename + string;
  else
    return (
      filename.substring(0, dotIndex) + string + filename.substring(dotIndex)
    );
}

function _uploadFile(fileName, file) {
  const uploadTask = firebaseClient.storage().ref(`/${fileName}`).put(file);

  return uploadTask;
}
