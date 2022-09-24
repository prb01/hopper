import hopper from "../../assets/hopper.webp";
import { Container, Row, Col, Table } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { fetchBookingById } from "redux/booking";
const jwt = require("jsonwebtoken");

const Thankyou = () => {
  const dispatch = useDispatch();
  const baseURI = window.location.origin;
  const {
    data: bookingData,
    isLoaded: bookingIsLoaded,
    hasErrors: bookingHasErrors,
  } = useSelector((state) => state.booking);
  const stripeDataIsLoaded = !(bookingData.stripe?.amount === "");

  const useQuery = () => {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  };

  const query = useQuery();
  const bookingToken = query.get("booking");
  const key = process.env.REACT_APP_JWT_SECRET;

  const result = jwt.verify(bookingToken, key, { algorithm: "HS256" }, (err, decoded) => {
    if (err) {
      return { error: err.name, ...err };
    }

    return decoded;
  });

  if (result.error) {
    return (
      <div className="vh-100 vw-100 d-flex justify-content-center align-items-center">
        <div className="bg-white text-center">
          <h4 className="text-danger">{result.error}</h4>
          <h4 className="text-danger">{JSON.stringify(result.expiredAt)}</h4>
        </div>
      </div>
    );
  }

  const bookingId = result.bookingId;
  useEffect(() => {
    if (!bookingIsLoaded || !stripeDataIsLoaded) {
      dispatch(fetchBookingById({ id: bookingId }));
    }
  }, [bookingIsLoaded, stripeDataIsLoaded]);

  const styles = {
    h3: {
      zIndex: 10,
      position: "relative",
    },
    img: {
      position: "relative",
      transform: "translateX(-50%)",
      left: "65%",
    },
    container: {
      maxWidth: "620px",
    },
    logo: {
      color: "#f9ff00",
      fontFamily: "'Concert One', sans-serif",
      fontSize: "2rem",
      textShadow: "-2px 2px 0px #ff5f92, 0 0 3px #2E1766, 0 0 10px #2E1766",
      position: "relative",
      top: "-10px",
    },
    h5: {
      textAlign: "right",
      fontSize: "18px",
    },
    total: {
      fontSize: "18px",
    },
  };

  return (
    <>
      {bookingHasErrors && "Error Loading"}
      {bookingIsLoaded && (
        <section className="d-flex flex-column align-items-center min-vh-100 h-100 checkout-bg p-3 overflow-auto pt-4 pb-4">
          <div className="d-flex position-relative">
            <img
              src={hopper}
              width="350px"
              style={styles.img}
              alt="Jim Hopper from Stranger Things"
            />
          </div>
          <Container
            className="px-2 pt-3 pb-2 bg-white rounded shadow-lg"
            style={styles.container}
          >
            <Row className="mx-1 pb-2 d-flex align-items-center border-bottom">
              <Col>
                <span style={styles.logo}>HOPPER</span>
              </Col>
              <Col className="d-flex justify-content-end">
                <h5 style={styles.h5}>
                  <b>ORDER CONFIRMATION</b>
                </h5>
              </Col>
            </Row>
            <Row className="mx-1 mt-4">
              <h5 className="text-primary">
                Hello {`${bookingData.customer?.first} ${bookingData.customer?.last}`}
              </h5>
            </Row>
            <Row className="mx-1">
              <p>Thank you for choosing to hop with us!</p>
              <p>
                Please ensure that all hoppers fill out the waiver prior to arriving (you can
                find the links below). Remember to arrive 10 minutes prior to your booked time
                to allow time for check-in & to change into your awesome hopper socks.
              </p>
            </Row>
            <Row className="mx-1 mt-4 d-flex align-items-center border-bottom">
              <h5 className="text-primary">
                Order Details #{" "}
                <span className="text-dark">{bookingData.stripe?.transactionID}</span>
              </h5>
            </Row>
            <Row className="mx-1 mt-4">
              <Table borderless size="sm" responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingData.order?.products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <b>{product.title}</b>
                        <br />
                        <i className="pl-1">
                          {product.time &&
                            `${bookingData.order?.bookingDate} @ ${product.time}`}
                        </i>
                      </td>
                      <td className="text-center">{product.quantity}</td>
                      <td>${(product.price * product.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Row>
            {stripeDataIsLoaded && (
              <Row className="mx-1 mt-4 w-50 d-flex ml-auto" style={styles.total}>
                <Col>
                  <b>Grand Total:</b>
                </Col>
                <Col>
                  <b>${(bookingData.stripe?.amount / 100).toFixed(2)}</b>
                </Col>
              </Row>
            )}
            <Row className="mx-1 mt-4 d-flex align-items-center border-bottom">
              <h5 className="text-primary">Waivers</h5>
            </Row>
            <Row className="mx-1 mt-2">
              <p>
                Please remember that each participant must sign their waiver before coming to
                Hopper.
              </p>
            </Row>
            {stripeDataIsLoaded && (
              <Row className="mx-1 mt-4">
                {bookingData.participants?.map((participant) => {
                  const waiverURI = `${baseURI}/waiver/${bookingId}/${participant.waiverId}`;

                  return (
                    <Row key={participant.waiverId} className="d-flex flex-column mx-1 mb-3">
                      <div>
                        <b>{participant.fullName}</b>
                      </div>
                      <div>
                        <a href={waiverURI} target="_blank">
                          {waiverURI}
                        </a>
                      </div>
                    </Row>
                  );
                })}
              </Row>
            )}
            <Row className="mx-1 mt-5 pt-2 d-flex justify-content-center border-top">
              <p className="text-center text-secondary">Hopper limited ®</p>
            </Row>
          </Container>
        </section>
      )}
    </>
  );
};

export default Thankyou;
