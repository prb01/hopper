import React from "react";
import { useWizard } from "react-use-wizard";
import { useDispatch } from 'react-redux';
import { setParticipants } from 'redux/cartDetails';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button, Form, FormGroup, Input, Label, Col } from "reactstrap";

function Participants() {
  const dispatch = useDispatch();
  const { nextStep, previousStep } = useWizard();
  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    setError,
    formState: { errors },
  } = useForm({
    // defaultValues: {}; you can populate the fields by this attribute
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  const onSubmit = (data) => {
    const { participants } = data;
    dispatch(setParticipants(participants));
    nextStep();
  };

  return (
    <div>
      <Form
        onSubmit={handleSubmit(onSubmit)}
      >
        <ul className="list-unstyled">
          {fields.map((item, index) => (
            <li key={item.id}>
              <FormGroup row>
                <Label for="fullName" sm={3}>
                  Full Name
                </Label>
                <Col sm={9}>
                  <Controller
                    render={({ field }) => <Input id="fullName" {...field} />}
                    name={`participants.${index}.fullName`}
                    control={control}
                  />
                </Col>
                <Button type="button" onClick={() => remove(index)}>
                  Remove Jumper
                </Button>
              </FormGroup>
            </li>
          ))}
        </ul>
        <hr />
        <Button type="button" color="primary" className="mb-3" onClick={() => append({ fullName: "" })}>
          Add Jumper
        </Button>
        <div className="d-flex">
          <Button
            color="secondary"
            onClick={() => previousStep()}
            className={"flex-grow-1 w-50 mr-2"}
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
      </Form>
    </div>
  );
}

export default Participants;
