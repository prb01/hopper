import { Button, Container, Form, FormGroup, Input, Label, Col, Row } from "reactstrap";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { jsPDF } from "jspdf";
import { useDispatch, useSelector } from "react-redux";
import { saveFile } from "redux/waiver";
import { useParams } from "react-router-dom";
import { fetchBookingById } from "redux/booking";
import { fetchWaiverById, updateWaiver } from "redux/waiver";

const WaiverForm = () => {
  const dispatch = useDispatch();
  const { bookingId, waiverId } = useParams();
  const [sig, setSig] = useState(false);
  const {
    data: bookingData,
    isLoaded: bookingIsLoaded,
    hasErrors: bookingHasErrors,
  } = useSelector((state) => state.booking);
  const {
    data: waiverData,
    isLoaded: waiverIsLoaded,
    hasErrors: waiverHasErrors,
  } = useSelector((state) => state.waiver);
  const company = "Hopper";
  const state = "New York";
  const sigPad = useRef(null);

  useEffect(() => {
    fetch("https://www.cloudflare.com/cdn-cgi/trace")
      .then((response) => response.text())
      .then((data) => {
        data = data
          .trim()
          .split("\n")
          .reduce(function (obj, pair) {
            pair = pair.split("=");
            return (obj[pair[0]] = pair[1]), obj;
          }, {});

        if (data.ip) setValue("ipAddress", data.ip);
        if (data.uag) setValue("userAgent", data.uag);
      });

    dispatch(fetchBookingById({ id: bookingId }));
    dispatch(fetchWaiverById({ id: waiverId }));

    if (waiverIsLoaded) {
      setValue("fullName", waiverData.fullName);
    }
  }, [fetch, dispatch, waiverIsLoaded]);

  const reservationDate = () => {
    if (!bookingIsLoaded) return null;

    const date = new Date(bookingData.order?.bookingDate);

    return date.toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: waiverData.fullName,
      guardian: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      ipAddress: "",
      userAgent: "",
    },
  });

  const msgIfEmpty = (name = "") => `${name} cannot be empty`;

  const { ref: fullNameRef, ...fullNameRest } = register("fullName", {
    required: msgIfEmpty("Name"),
  });
  const { ref: guardianRef, ...guardianRest } = register("guardian");
  const { ref: emailRef, ...emailRest } = register("email", {
    required: msgIfEmpty("Email"),
  });
  const { ref: dateRef, ...dateRest } = register("date", {
    required: msgIfEmpty("Date"),
  });
  const { ref: ipAddressRef, ...ipAddressRest } = register("ipAddress", {
    required: msgIfEmpty("IP Address"),
  });
  const { ref: userAgentRef, ...userAgentRest } = register("userAgent", {
    required: msgIfEmpty("User Agent"),
  });

  const requireSignature = (v) => {
    if (!sig) return msgIfEmpty("Signature");
    return true;
  };

  const handleSigClear = () => {
    sigPad.current?.clear();
    setSig(false);
  };

  const handleSig = () => {
    setSig(true);
  };

  const onSubmit = (data) => {
    if (Object.keys(errors).length) {
      alert("Error saving product: " + JSON.stringify(errors));
    } else {
      const doc = new jsPDF("p", "pt", "letter");
      const waiverPDF = document.getElementById("waiverPDF");

      doc.html(waiverPDF, {
        callback: function (doc) {
          const blob = new Blob([doc.output("blob")], { type: "application/pdf" });
          const file = new File([blob], "waiver.pdf");

          dispatch(saveFile({ file })).then((action) => {
            const fileUrl = action.payload;
            if (fileUrl) {
              dispatch(
                updateWaiver({
                  id: waiverId,
                  fullName: data.fullName,
                  guardian: data.guardian,
                  email: data.email,
                  date: data.date,
                  ipAddress: data.ipAddress,
                  userAgent: data.userAgent,
                  submitted: true,
                  waiverURL: fileUrl,
                })
              ).then(() => {
                reset();
                handleSigClear();
                console.log("added to DB");
              });
            }
          });
        },
        autoPaging: "text",
        x: -20,
        y: 0,
        windowWidth: 1200,
        width: 650,
        // margin: [80, 40, 60, 40]
      });
    }
  };

  return (
    <section className="p-sm-3 checkout-bg">
      <Container fluid="sm" id="waiverPDF" className="bg-white border p-sm-5 pt-3 pb-3">
        {waiverIsLoaded && waiverData.submitted && (
          <div className="text-center">
            <h2>Thanks for submitting your waiver!</h2>
          </div>
        )}
        {waiverIsLoaded && !waiverData.submitted && (
          <>
            <div className="mb-5">
              <h2 className="text-center mb-4">
                ACCIDENT WAIVER AND RELEASE OF LIABILITY FORM
              </h2>
              <p>
                I (and/or my child) am participating in a {company} event on the date(s)
                specified below (“Event”) and HEREBY ASSUME ALL OF THE RISKS OF PARTICIPATING
                AND/OR VOLUNTEERING IN THIS EVENT, including by way of example and not
                limitation, any risks that may arise from negligence, gross negligence, or
                carelessness on the part of the persons or entities being released or other
                participants or volunteers in the event, from dangerous or defective equipment
                or property owned, maintained, or controlled by them, or because of any of
                their possible liability without fault.
              </p>
              <p>
                I am participating in this Event purely on a voluntary basis. It is for
                recreational purposes only and is not required, expected, or encouraged as a
                condition or part of my employment, school curriculum, or otherwise. I
                acknowledge that this Event may carry with it the potential for death, serious
                injury, and property loss. I understand these risks are inherent to
                participants in the Event, including myself. I certify that there are no
                health-related reasons or problems that preclude my participation in this Event
                and that I have not been advised to not participate in this Event, or any other
                athletic activities, by any medical professional. I acknowledge that this
                Release will be used by the Event holders and organizers, and that it will
                govern my actions and responsibilities at the Event and that it will apply
                equally to any future {company} event in which I participate, whether I am
                required to sign an additional release for such future events or not.
              </p>
              <p>
                In consideration of my application and permitting me to participate in this
                Event, I hereby agree as follows for myself, my executors, administrators, and
                assigns (“Releasing Parties”) as follows:
              </p>
              <ol type="A">
                <li>
                  I WAIVE, RELEASE, AND FOREVER DISCHARGE from any and all liability, including
                  but not limited to, liability arising from the negligence or fault of the
                  Released Parties, for my death, disability, personal injury, property damage,
                  injuries from equipment or any other product used during the Event, property
                  theft, torts of any kind, or actions of any kind which may occur to me during
                  the Event (which shall include my traveling to and from this activity or
                  event), THE FOLLOWING ENTITIES OR PERSONS:
                  {company}, Inc., the owners, the employees, lessees, or sublessees of the
                  property(ies) at which the Event is held, and the Event holders/hosts,
                  including their managers, members, owners, directors, officers, employees,
                  volunteers, representatives, agents, successors, and assigns (“Released
                  Parties”);
                </li>
                <li>
                  I WAIVE the provisions of California Civil Code Section 1542 which provides
                  "A general release does not extend to claims which the creditor does not know
                  or suspect to exist in his or her favor at the time of executing the release,
                  which if known by him or her must have materially affected his or her
                  settlement with the debtor," or any equivalent statute in my state of
                  residence or in the state in which the Event is held.
                </li>
                <li>
                  I INDEMNIFY, HOLD HARMLESS, AND PROMISE TO DEFEND the Released Parties from
                  any and all liabilities or claims made as a result of my participation in
                  this Event, whether caused by my negligence, intentional or negligent acts or
                  omissions, or otherwise.
                </li>
              </ol>
              <p>
                I acknowledge that neither the Released Parties are responsible for the errors,
                omissions, acts, or failures to act of any party or entity conducting the Event
                on behalf of the Released Parties or that I attend through or at the invitation
                of the Released Parties. This Release, however, is not intended to discharge
                the Released Parties from liability for fraud or violation of a statutory duty.
              </p>
              <p>
                I hereby consent to receive medical treatment, which may be deemed advisable in
                the event of injury, accident, and/or illness during the Event (including
                during travel to and from the Event). For the sake of clarity, any decision or
                act by any Released Party to provide, request, or otherwise induce the
                provision of any medical treatment to me as a result of an injury, accident, or
                illness during the Event shall be covered by this Release.
              </p>
              <p>
                This Release shall be construed broadly to provide a release and waiver to the
                maximum extent permissible under applicable law. It shall be governed by{" "}
                {state} law.
              </p>
              <p>
                I CERTIFY THAT I HAVE READ THIS DOCUMENT, AND AM AT LEAST 18 YEARS OF AGE AND
                NOT A MINOR, AND I FULLY UNDERSTAND ITS CONTENT. I AM AWARE THAT THIS IS A
                RELEASE OF LIABILITY AND A CONTRACT THAT I AM AUTHORIZED AND COMPETENT TO SIGN
                IT ON BEHALF OF ALL RELEASING PARTIES, AND I SIGN IT OF MY OWN FREE WILL.
              </p>
            </div>
            <div>
              <FormGroup row>
                <Col sm={2}>
                  <b>Reservation date:</b>
                </Col>
                <Col sm={6}>{reservationDate()}</Col>
              </FormGroup>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <FormGroup row>
                  <Label for="fullName" sm={2}>
                    <b>
                      Participant name<span className="text-danger">*</span>:
                    </b>
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="fullName"
                      type="text"
                      {...fullNameRest}
                      innerRef={fullNameRef}
                      invalid={errors.fullName ? true : false}
                    />
                  </Col>
                </FormGroup>
                <p className="mt-4 mb-4">
                  If Participant is under the age of majority, I herby certify that I am the
                  parent / legal guardian of the above-named minor(s) and do hereby give
                  permission for him/her/them to be present on the premises, to use the
                  facilities, to receive instruction and to participate in the activities. I
                  understand that this permission and release form shall be on file and shall
                  be effective as long as the child is a minor or until we receive written
                  request to terminate this permission.
                </p>
                <FormGroup row>
                  <Label for="guardian" sm={2}>
                    <b>Guardian name:</b>
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="guardian"
                      type="text"
                      {...guardianRest}
                      innerRef={guardianRef}
                      invalid={errors.guardian ? true : false}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="email" sm={2}>
                    <b>
                      Email<span className="text-danger">*</span>:
                    </b>
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="email"
                      type="email"
                      {...emailRest}
                      innerRef={emailRef}
                      invalid={errors.email ? true : false}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="date" sm={2}>
                    <b>
                      Date of Signature<span className="text-danger">*</span>:
                    </b>
                  </Label>
                  <Col sm={6}>
                    <Input
                      id="date"
                      type="date"
                      {...dateRest}
                      innerRef={dateRef}
                      invalid={errors.date ? true : false}
                    />
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Label for="date" sm={2}>
                    <b>
                      Signature <span className="text-danger">*</span>:
                    </b>
                  </Label>
                  <Col sm={6}>
                    <Controller
                      name="signature"
                      control={control}
                      rules={{ validate: (v) => requireSignature(v) }}
                      render={({ field }) => (
                        <SignatureCanvas
                          penColor="blue"
                          clearOnResize={false}
                          onEnd={handleSig}
                          canvasProps={{
                            style: { maxHeight: "200px" },
                            className: "sigPad border w-100 h-100",
                          }}
                          ref={sigPad}
                        />
                      )}
                    />

                    <Button block outline color="secondary" onClick={handleSigClear}>
                      Clear
                    </Button>
                  </Col>
                </FormGroup>
                <Input
                  hidden
                  id="ipAddress"
                  innerRef={ipAddressRef}
                  invalid={errors.ipAddress ? true : false}
                  readOnly
                />
                <Input
                  hidden
                  id="userAgent"
                  innerRef={userAgentRef}
                  invalid={errors.userAgent ? true : false}
                  readOnly
                />
                <Button type="submit" color="primary" className="mt-5 ml-0" size="lg">
                  Submit Waiver
                </Button>
              </Form>
            </div>
          </>
        )}
      </Container>
    </section>
  );
};

export default WaiverForm;
