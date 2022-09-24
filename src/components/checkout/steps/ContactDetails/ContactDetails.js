import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setContactDetails } from 'redux/cartDetails';
import { useWizard } from 'react-use-wizard';
import { Button, FormGroup, Label } from 'reactstrap';
import WizardStep from 'components/checkout/wizard-parts/WizardStep';

const ContactDetails = () => {
  const dispatch = useDispatch();
  const { nextStep, previousStep } = useWizard();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    // console.log(errors);
    dispatch(setContactDetails(data));
    nextStep();
  }
  return (
    <WizardStep stepHeader="Enter your details">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormGroup>
          <Label for="first">First Name</Label>
          <input className="form-control" type="text" id="first" {...register("first", {required: true})} required />
        </FormGroup>
        <FormGroup>
          <Label for="last">Last Name</Label>
          <input type="text" id="last" className="form-control"  {...register("last", {required: true})} required />
        </FormGroup>
        <FormGroup>
          <Label for="address">Address</Label>
          <input type="text" id="address" className="form-control" {...register("address", {required: "This is required"})} required/>
        </FormGroup>
        <FormGroup>
          <Label for="zip">Zip Code</Label>
          <input type="text" id="zip" className="form-control" {...register("zip", {required: true})} required/>
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <input type="email" id="email" className="form-control" {...register("email", {required: true,
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Please input a valid email address."
            }})} required />
        </FormGroup>
        <div className="d-flex">
          <Button
            color="secondary"
            onClick={() => previousStep()}
            className={'flex-grow-1 w-50 mr-2'}
            outline
          >
            Back
          </Button>
          <Button
            type="submit"
            color="warning"
            className="flex-grow-1 w-75"
          >
            Continue
          </Button>
        </div>
      </form>
    </WizardStep>
  );
};

export default ContactDetails;
