// https://dev.to/thatgalnatalie/how-to-get-started-with-redux-toolkit-41e
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { reducer as user } from './user';
import { reducer as product } from './product';
import { reducer as room } from './room';
import { reducer as opentime } from './opentime';
import { reducer as customer } from './customer';
import { reducer as cartDetails } from './cartDetails';
import { reducer as booking } from './booking';
import { reducer as waiver } from './waiver';

const reducer = combineReducers({
  user,
  product,
  room,
  opentime,
  customer,
  cartDetails,
  booking,
  waiver 
});

const store = configureStore({
  reducer,
});

export default store;
