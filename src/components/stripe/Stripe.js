import React, { useState } from "react";
import { Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createBookingWithID, updateBooking } from "redux/booking";
require("firebase/functions");
const jwt = require("jsonwebtoken");

const Stripe = ({ clientSecret, newDocID, bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const redirectURI = `${window.location.origin}/thankyou`;

  console.log(`newDocId in Stripe ${newDocID}`);
  const createJWT = (payload) => {
    const key = process.env.REACT_APP_JWT_SECRET;
    const options = {
      expiresIn: 3600,
    };
    const token = jwt.sign(payload, key, options);

    return token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stripe.js has not yet loaded.
    // Make sure to disable form submission until Stripe.js has loaded.
    if (!stripe || !elements) {
      return;
    }

    // Create booking token used by ThankYou page (added to return url)
    console.log(`bookingId: ${newDocID}`);
    const bookingToken = createJWT({ bookingId: newDocID });

    // Create booking in PENDING status prior to confirming payment
    console.log({ bookingDetails });
    await dispatch(
      createBookingWithID({ ...bookingDetails, status: { type: "PENDING", text: "" } })
    );

    // const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${redirectURI}?booking=${bookingToken}`,
      },
    });

    // Update booking in FAILED status if payment fails
    console.log(bookingDetails.docID);
    await dispatch(
      updateBooking({
        docID: bookingDetails.docID,
        status: { type: "FAILED", text: `${error.type}: ${error.message}` },
      })
    );

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form /* id="payment-form" */ onSubmit={handleSubmit}>
      <PaymentElement /* id="payment-element" */ />
      <Button
        color="success"
        block
        className="my-3 w-full"
        disabled={isLoading || !stripe || !elements}
        /* id="submit" */ type="submit"
      >
        <span /* id="button-text" */>
          {isLoading ? <div /* className="spinner" id="spinner" */>loading</div> : "Pay now"}
        </span>
      </Button>
      {/* Show any error or success messages */}
      {message && <div /* id="payment-message" */>{message}</div>}
    </form>
  );
};

export default Stripe;
