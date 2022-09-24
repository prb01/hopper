import { Progress } from 'reactstrap';
import { useWizard } from 'react-use-wizard';

const WizardHeader = () => {
  const { activeStep, stepCount } = useWizard();
  let step = activeStep + 1;
  return (
    <div className="mb-4">
      <small className="text-uppercase mb-2 d-block">
        Step {step} of {stepCount}
      </small>
      <Progress value={step * (100 / 6)} color="warning" />
    </div>
  );
};

export default WizardHeader;
