import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import {
  createCustomer,
  updateCustomer,
  fetchAllCustomers,
} from "redux/customer";
import { useEffect } from "react";
import { firebase } from "firebase/client";
require("firebase/functions");

//const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CustomerDetails = (props) => {
  const dispatch = useDispatch();

  const {
    data: customerData,
    isLoaded,
    hasErrors,
  } = useSelector((state) => state.customer);

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { ref: firstNameRef, ...firstNameRest } = register("firstName", {
    required: true,
  });
  const { ref: lastNameRef, ...lastNameRest } = register("lastName", {
    required: true,
  });
  const { ref: emailRef, ...emailRest } = register("email", { required: true });
  const { ref: phoneRef, ...phoneRest } = register("phone", {
    required: true,
    valueAsNumber: true,
  });

  const onSubmit = (data) => {
    const createStripeCustomer = firebase
      .functions()
      .httpsCallable("createStripeCustomer");

    createStripeCustomer(data)
      .then((result) => {
        dispatch(
          updateCustomer({
            docID: result.data.docID,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          })
        ); //.then(() => dispatch(fetchAllCustomers()));
      })
      .catch((error) => {
        console.log(`error: ${JSON.stringify(error)}`);
      });
  };

  return (
    <section>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="p-3 my-3 border border-primary"
      >
        <FormGroup>
          <Label for="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            {...firstNameRest}
            innerRef={firstNameRef}
            invalid={errors.firstName}
          />
        </FormGroup>
        <FormGroup>
          <Label for="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            {...lastNameRest}
            innerRef={lastNameRef}
            invalid={errors.lastName}
          />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="text"
            {...emailRest}
            innerRef={emailRef}
            invalid={errors.email}
          />
        </FormGroup>
        <FormGroup>
          <Label for="phone">Phone Number</Label>
          <Input
            id="phone"
            type="text"
            pattern="[0-9]*"
            {...phoneRest}
            innerRef={phoneRef}
            invalid={errors.phone}
          />
        </FormGroup>
        <Button type="submit" color="primary">
          Continue
        </Button>
      </Form>
    </section>
  );
};

export default CustomerDetails;
