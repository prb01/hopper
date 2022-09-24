import { firebase } from "firebase/client";
require("firebase/functions");
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spinner, Button } from 'reactstrap';

const TimeSelect = ({ duration, id, timeSlots, handleSetTime }) => {
  const [timeslots, setTimeslots] = useState([]);

  const bookingDate = useSelector(({ cartDetails }) => cartDetails.bookingDate);

  useEffect( () => {
    const getRemainingCapacity = firebase.functions().httpsCallable('getRemainingCapacity');
    const fetchCapacities = async () => {
      const data = await getRemainingCapacity({ date: bookingDate });
      setTimeslots(data.data[id]);
      return data;
    }
    fetchCapacities().catch(console.error);
  }, [bookingDate]);

  console.log(timeslots);

  const determineAvailability = (duration, time, times) => {
    switch (true) {
      case (duration === 120):
        return time.remainingCapacity <= 0 || times[time.idx + 1]?.remainingCapacity <= 0 || times[time.idx + 2]?.remainingCapacity <= 0 || times[time.idx + 3]?.remainingCapacity <= 0 ? true : false;
      case (duration === 90):
        return time.remainingCapacity <= 0  || times[time.idx + 1]?.remainingCapacity <= 0 || times[time.idx + 2]?.remainingCapacity <= 0 ? true : false;
      case (duration === 60):
        return time.remainingCapacity <= 0 || times[time.idx + 1]?.remainingCapacity <= 0 ? true : false;
    }
  };

  return (
    <>
      <div role="group" data-toggle="buttons" className="d-flex flex-wrap mb-3">
      {!timeslots ? (<div className="py-3 w-100 d-flex my-4 justify-content-center">
          <Spinner color="primary" />
        </div>) : (<>{timeslots.map((time, index, times) => {
          return (
            <Button
              data-toggle="button"
              key={time.idx}
              className="mr-2 mb-2"
              onClick={() => handleSetTime(id, time.time)}
              disabled={determineAvailability(duration, time, times)}
            >
              {time.time}
            </Button>
          )
        })}</>)}
      </div>
    </>
  );
};

export default TimeSelect;
