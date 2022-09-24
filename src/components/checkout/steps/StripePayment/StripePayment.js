import { useWizard } from "react-use-wizard";
import { useState, useEffect, useMemo } from "react";
import { Button } from "reactstrap";
import WizardStep from "components/checkout/wizard-parts/WizardStep";
import Stripe from "components/stripe/Stripe";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { firebase } from "firebase/client";
require("firebase/functions");
import { useDispatch, useSelector } from "react-redux";
import { createBookingWithID } from "redux/booking";
import uniqid from "uniqid";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripePayment = () => {
  const { previousStep } = useWizard();
  const [clientSecret, setClientSecret] = useState("");
  const dispatch = useDispatch();
  const { bookingDate, products, customerDetails, participants } = useSelector(
    ({ cartDetails }) => cartDetails
  );

  const newDocID = useMemo(() => uniqid(), []);
  console.log(`newDocId in StripePayment ${newDocID}`);

  const bookingDetails = {
    docID: newDocID,
    customer: customerDetails,
    order: {
      bookingDate: bookingDate,
      products: products,
    },
    stripe: {
      transactionID: "",
      confirmDate: "",
      amount: "",
      receiptURL: "",
    },
    participants: participants,
  };

  useEffect(() => {
    const createPaymentIntent = firebase.functions().httpsCallable("createPaymentIntent");

    createPaymentIntent(bookingDetails).then((result) =>
      setClientSecret(result.data.clientSecret)
    );
  }, []);

  const options = {
    // passing the client secret obtained from the server
    clientSecret: clientSecret,
    loader: "always",
  };
  return (
    <WizardStep stepHeader="Select payment details">
      <div>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <Stripe
              clientSecret={clientSecret}
              newDocID={newDocID}
              bookingDetails={bookingDetails}
            />
          </Elements>
        )}
      </div>
      <div className="d-flex">
        <Button
          color="secondary"
          onClick={() => previousStep()}
          className={"flex-grow-1 w-50"}
          outline
        >
          Back
        </Button>
      </div>
    </WizardStep>
  );
};

export default StripePayment;
