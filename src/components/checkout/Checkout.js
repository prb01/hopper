import { Container, Row } from 'reactstrap';
import WizardContainer from 'components/checkout/wizard-parts/WizardContainer';
import Cart from './cart/Cart';

const Checkout = () => {
  return (
    <div className="checkout-bg">
      <Container className="py-5">
        <Row xs="1">
          <WizardContainer />
          <Cart />
        </Row>
      </Container>
    </div>
  );
};

export default Checkout;
