import { useWizard } from 'react-use-wizard';
import { Button } from 'reactstrap';

const WizardButtons = () => {
  const { nextStep, isFirstStep, isLastStep, previousStep } = useWizard();
  return (
    <div className="d-flex">
      {!isFirstStep ? (
        <Button
          color="secondary"
          onClick={() => previousStep()}
          className={`flex-grow-1 w-50 ${isLastStep ? '' : 'mr-2'}`}
          outline
        >
          Back
        </Button>
      ) : null}
      {!isLastStep ? (
        <Button
          color="warning"
          onClick={() => nextStep()}
          className="flex-grow-1 w-75"
        >
          Continue
        </Button>
      ) : null}
    </div>
  );
};

export default WizardButtons;
