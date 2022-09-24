import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, reduceQty, removeFromCart } from 'redux/cartDetails';
import { fetchAllProducts } from 'redux/product';
import { useWizard } from 'react-use-wizard';
import { Button, Spinner, InputGroup, Input } from 'reactstrap';
import socks from 'assets/socks.jpeg';
import WizardStep from 'components/checkout/wizard-parts/WizardStep';

const Addon = ({ ...props }) => {
  let { id, title, price, type } = props;
  const dispatch = useDispatch();
  const [quant, setQuant] = useState(0);

  const handleQuantity = () => {
    setQuant(e.target.value);
  };
  const increment = (id, title, price, type) => {
    setQuant(quant + 1);
    dispatch(
      addToCart({
        id: id,
        title: title,
        price: price,
        type: type,
        duration: null,
        timeSlot: null,
        quantity: 0,
      })
    );
  };

  const decrement = (id) => {
    if (quant > 0) {
      setQuant(quant - 1);
      dispatch(reduceQty(id));
    }
  };
  return (
    <div className="d-flex align-items-center mb-3">
      <p className="mr-auto mb-0">
        <span className="d-block">{title}</span>
        <span className="font-weight-bold d-block">${price.toFixed(2)}</span>
      </p>
      <InputGroup className="align-self-md-end product-checkout-quantity">
        <div className="input-group-prepend">
          <Button onClick={() => decrement(id)}>-</Button>
        </div>
        <Input
          className="text-center"
          placeholder={quant}
          value={quant}
          onChange={handleQuantity}
        />
        <div className="input-group-append">
          <Button onClick={() => increment(id, title, price, type)}>+</Button>
        </div>
      </InputGroup>
    </div>
  );
};

const AddonSelect = () => {
  const { nextStep, previousStep } = useWizard();
  const dispatch = useDispatch();
  const [quant, setQuant] = useState(0);
  const { data, isLoaded, hasErrors } = useSelector((state) => state.product);
  const addons = data.filter(({ type }) => type === 'addon');

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <WizardStep stepHeader="Select add-ons">
      <div className="d-flex align-items-center mb-4">
        <img
          src={socks}
          alt="A picture of multicoloured socks"
          height="90"
          width="auto"
          className="mr-3"
        />
        <p>
          <span className="font-weight-bold d-block">
            Trampoline Park Socks
          </span>
          Socks with a grip, so you don't slip.
        </p>
      </div>
      {!isLoaded ? (
        <div className="py-3 w-100 d-flex justify-content-center">
          <Spinner color="primary" />
        </div>
      ) : (
        <div className="mb-4">
          <div>
            {addons.map(({ id, title, price, type }) => (
              <Addon key={id} {...{ id, title, price, type }} />
            ))}
          </div>
        </div>
      )}
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
          color="warning"
          onClick={() => nextStep()}
          className="flex-grow-1 w-75"
        >
          Continue
        </Button>
      </div>
    </WizardStep>
  );
};

export default AddonSelect;
