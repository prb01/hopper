import { useForm } from "react-hook-form";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { createOpenTime } from "redux/opentime";
import { useDispatch } from "react-redux";
import { format } from "date-fns";

const DateSelect = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { ref: selectedDateRef, ...selectedDateRest } = register(
    "selectedDate",
    { required: true }
  );
  const { ref: startRef, ...startRest } = register("start", { required: true });
  const { ref: endRef, ...endRest } = register("end", { required: true });

  const onSubmit = (data) => {
    if (Object.keys(errors).length) {
      alert("Error saving product: " + JSON.stringify(errors));
    } else {
      dispatch(
        createOpenTime({
          date: data.selectedDate,
          open: data.start,
          close: data.end,
        })
      ).then(() => {
        alert(`Open & Close times for ${format(new Date(data.selectedDate),"dd/MM/yyyy")} added to Database`);
        reset();
        console.log(data.selectedDate);
      });
    }
  };

  return (
    <div>
      <div className="mb-4"></div>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="p-3 my-3 border border-primary"
      >
        <FormGroup>
          <Label for="selectedDate">Date</Label>
          <Input
            id="selectedDate"
            type="date"
            {...selectedDateRest}
            innerRef={selectedDateRef}
            invalid={errors.selectedDate}
          />
        </FormGroup>
        <FormGroup>
          <Label for="start">Open Time</Label>
          <Input
            id="start"
            type="time"
            {...startRest}
            innerRef={startRef}
            invalid={errors.start}
          />
        </FormGroup>
        <FormGroup>
          <Label for="end">Closing Time</Label>
          <Input
            id="end"
            type="time"
            {...endRest}
            innerRef={endRef}
            invalid={errors.end}
          />
        </FormGroup>
        <Button type="submit" color="primary">
          Save Day
        </Button>
      </Form>
    </div>
  );
};

export default DateSelect;
