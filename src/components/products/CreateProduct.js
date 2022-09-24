import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { createProduct, savePhoto } from "redux/product";
import { fetchAllRooms } from "redux/room";

const CreateProduct = (props) => {
  const dispatch = useDispatch();
  const { data, isLoaded, hasErrors } = useSelector((state) => state.room);

  useEffect(() => {
    dispatch(fetchAllRooms());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      desc: "",
      type: "",
      price: 0,
      photo: "",
      status: "",
      room: null,
      duration: null,
    },
  });

  const msgIfEmpty = (name = "") => `${name} cannot be empty`;

  const { ref: titleRef, ...titleRest } = register("title", {
    required: msgIfEmpty("Title"),
  });
  const { ref: descRef, ...descRest } = register("desc", {
    required: msgIfEmpty("Description"),
  });
  const { ref: typeRef, ...typeRest } = register("type", {
    required: msgIfEmpty("Type"),
  });
  const { ref: priceRef, ...priceRest } = register("price", {
    required: msgIfEmpty("Price"),
    valueAsNumber: true,
  });
  const { ref: photoRef, ...photoRest } = register("photo", {
    required: msgIfEmpty("Photo"),
  });
  const { ref: statusRef, ...statusRest } = register("status", {
    required: msgIfEmpty("Status"),
  });
  const { ref: roomRef, ...roomRest } = register("room", {
    validate: (v) => requiredIfProductType(v),
  });
  const { ref: durationRef, ...durationRest } = register("duration", {
    validate: (v) => requiredIfProductType(v),
    setValueAs: (v) => parseInt(v),
  });

  const requiredIfProductType = (v) => {
    if (getValues("type") === "product" && (v == null || v === NaN || v.length === 0))
      return msgIfEmpty();
    return true;
  };

  const onSubmit = (data) => {
    if (Object.keys(errors).length) {
      alert("Error saving product: " + JSON.stringify(errors));
    } else {
      dispatch(savePhoto({ file: data.photo[0] })).then((action) => {
        const photoUrl = action.payload;
        if (photoUrl) {
          dispatch(
            createProduct({
              title: data.title,
              desc: data.desc,
              type: data.type,
              price: data.price,
              photo: photoUrl,
              status: data.status,
              room: data.room,
              duration: data.duration,
            })
          ).then(() => {
            reset();
            console.log("added to DB");
          });
        }
      });
    }
  };

  return (
    <>
      {!isLoaded && "Form loading..."}
      {hasErrors && "Error Loading"}
      {isLoaded && (
        <Form onSubmit={handleSubmit(onSubmit)} className="p-3 my-3 border border-primary">
          <FormGroup>
            <Label for="title">
              Title<span className="text-danger">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              {...titleRest}
              innerRef={titleRef}
              invalid={errors.title ? true : false}
            />
          </FormGroup>
          <FormGroup>
            <Label for="desc">
              Description<span className="text-danger">*</span>
            </Label>
            <Input
              id="desc"
              type="text"
              {...descRest}
              innerRef={descRef}
              invalid={errors.desc ? true : false}
            />
          </FormGroup>
          <FormGroup>
            <Label for="type">
              Type<span className="text-danger">*</span>
            </Label>
            <Input
              id="type"
              type="select"
              {...typeRest}
              innerRef={typeRef}
              invalid={errors.type ? true : false}
              onChange={(e) => {
                typeRest.onChange(e);
                resetField("room");
                resetField("duration");
              }}
            >
              <option value="" hidden></option>
              <option value="addon">Add-On</option>
              <option value="product">Product</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="room">
              Room<span className="text-danger">*</span>
            </Label>
            <Input
              id="room"
              type="select"
              {...roomRest}
              innerRef={roomRef}
              invalid={errors.room ? true : false}
              disabled={watch("type") !== "product"}
            >
              <option value="" hidden></option>
              {data.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="duration">
              Duration<span className="text-danger">*</span>
            </Label>
            <Input
              id="duration"
              type="select"
              {...durationRest}
              innerRef={durationRef}
              invalid={errors.duration ? true : false}
              disabled={watch("type") !== "product"}
            >
              <option value="" hidden></option>
              <option value="0">All Day</option>
              <option value="60">60min</option>
              <option value="90">90min</option>
              <option value="120">120min</option>
              {/* Get all durations to display as options */}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="price">
              Price<span className="text-danger">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              {...priceRest}
              innerRef={priceRef}
              invalid={errors.price ? true : false}
            />
          </FormGroup>
          <FormGroup>
            <Label for="photo">
              Photo<span className="text-danger">*</span>
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              {...photoRest}
              innerRef={photoRef}
              invalid={errors.photo ? true : false}
            />
          </FormGroup>
          <FormGroup>
            <Label for="status">
              Status<span className="text-danger">*</span>
            </Label>
            <Input
              id="status"
              type="select"
              {...statusRest}
              innerRef={statusRef}
              invalid={errors.status ? true : false}
            >
              <option value="" hidden></option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Input>
          </FormGroup>
          <Button type="submit" color="primary">
            Save Product
          </Button>
        </Form>
      )}
    </>
  );
};

export default CreateProduct;
