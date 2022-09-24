import { Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { setBookingDate } from 'redux/cartDetails';
import { useWizard } from 'react-use-wizard';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import WizardStep from 'components/checkout/wizard-parts/WizardStep';
import 'react-calendar/dist/Calendar.css';
import './dateSelect.css';

const DateSelect = () => {
  const { nextStep } = useWizard();
  const [date, setDate] = useState(new Date());
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBookingDate(
        date.toISOString().split('T')[0]
      )
    );
  }, [date]);

  return (
    <WizardStep stepHeader="Select a date">
      <div className="mb-4">
        <Calendar
          onChange={setDate}
          value={date}
          minDate={new Date()}
          maxDate={new Date('December 31, 2025')}
        />
      </div>
      <div className="d-flex">
        <Button
          color="warning"
          onClick={() => nextStep()}
          className="flex-grow-1 w-75"
          disabled={!date}
        >
          Continue
        </Button>
      </div>
    </WizardStep>
  );
};

export default DateSelect;
