import { createSlice } from '@reduxjs/toolkit';

const cartDetails = createSlice({
  name: 'cart',
  initialState: {
    bookingDate: '',
    products: [],
    costs: { subtotal: 0, total: 0 },
    customerDetails: {
      first: '',
      last: '',
      address: '',
      zip: '',
      email: ''
    },
    waiver: {
      waiverURL: '',
      ipAddress: '',
      userAgent: ''
    },
    participants: null,
    headcount: 0,
  },
  reducers: {
    setParticipants: (state, action) => {
      state.participants = action.payload.map(participant => participant);
    },
    setContactDetails: (state, action) => {
      state.customerDetails = action.payload;
    },
    getHeadcount: (state, action) => {
      state.headcount = state.products
        .filter((product) => product.type === 'product')
        .reduce((total, { quantity }) => total + quantity, 0);
    },
    getCosts: (state, action) => {
      let productSubtotal = state.products.reduce(
        (subtotal, { price, quantity }) => subtotal + price * quantity,
        0
      );
      state.costs.subtotal = productSubtotal;
      state.costs.total = productSubtotal + 5.0 + productSubtotal * 0.05;
    },
    setBookingDate: (state, action) => {
      state.bookingDate = action.payload;
    },
    setBookingTime: (state, action) => {
      state.products = state.products.map((product) => {
        if (product.id === action.payload.id) {
          return { ...product, time: action.payload.time };
        } else {
          return product;
        }
      });
    },
    addToCart: (state, action) => {
      if (
        state.products.find((product) => product.id === action.payload.id) ==
        null
      ) {
        state.products.push({
          ...action.payload,
          quantity: action.payload.quantity + 1,
        });
      } else {
        state.products = state.products.map((product) => {
          if (product.id === action.payload.id) {
            return {
              ...product,
              quantity: product.quantity + 1,
            };
          } else {
            return product;
          }
        });
      }
    },
    reduceQty: (state, action) => {
      const productToRemove = state.products.find(
        (product) => product.id === action.payload
      );

      if (productToRemove.quantity > 0) {
        state.products = state.products.map((product) => {
          if (product.id === action.payload) {
            return { ...product, quantity: product.quantity - 1 };
          }
          return product;
        });
      }
      if (productToRemove.quantity === 1) {
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
      }
    },
    removeFromCart: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
    },
  },
});

export const reducer = cartDetails.reducer;

export const {
  setParticipants,
  setContactDetails,
  getHeadcount,
  getCosts,
  setBookingDate,
  setBookingTime,
  reduceQty,
  addToCart,
  removeFromCart,
} = cartDetails.actions;
