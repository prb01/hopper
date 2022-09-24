import { Col } from 'reactstrap';
import { Wizard } from 'react-use-wizard';
import WizardHeader from 'components/checkout/wizard-parts/WizardHeader';
import DateSelect from 'components/checkout/steps/DateSelect/DateSelect';
import ProductSelect from 'components/checkout/steps/ProductSelect/ProductSelect';
import AddonSelect from 'components/checkout/steps/AddonSelect/AddonSelect';
import ContactDetails from 'components/checkout/steps/ContactDetails/ContactDetails';
import Waiver from 'components/checkout/steps/Waiver/Waiver';
import StripePayment from 'components/checkout/steps/StripePayment/StripePayment';

const WizardContainer = () => {
  return (
    <Col className="col-md-7 pb-2 pb-md-0">
      <div className="px-4 pt-4 pb-3 bg-white rounded">
        <h1>Buy a Pass</h1>
        <hr />
        <Wizard header={<WizardHeader />}>
          <DateSelect />
          <ProductSelect />
          <AddonSelect />
          <ContactDetails />
          <Waiver />
          <StripePayment />
        </Wizard>
      </div>
    </Col>
  );
};

export default WizardContainer;
