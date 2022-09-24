const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const stripeWebhook = require("stripe")(process.env.STRIPE_WEBHOOK_KEY);
const endpointSecret = process.env.STRIPE_SIGNING_KEY;

console.log({
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_KEY: process.env.STRIPE_WEBHOOK_KEY,
  STRIPE_SIGNING_KEY: process.env.STRIPE_SIGNING_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
});

const sgMail = require("@sendgrid/mail");
const {
  millisecondsToMinutes,
  hoursToSeconds,
  minutesToSeconds,
  secondsToHours,
  secondsToMinutes,
} = require("date-fns");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.createStripeCustomer = functions.https.onCall(async (data, context) => {
  const fullName = `${data.firstName} ${data.lastName}`;
  const customer = await stripe.customers.create({
    name: fullName,
    email: data.email,
    phone: data.phone,
  });
  const intent = await stripe.setupIntents.create({ customer: customer.id });
  await admin.firestore().collection("stripe_customers").add({
    customer_id: customer.id,
    setup_secret: intent.client_secret,
  });
  const snapshot = await admin
    .firestore()
    .collection("stripe_customers")
    .where("customer_id", "==", customer.id)
    .get();
  const snap = snapshot.docs[0].id;

  return {
    customerID: customer.id,
    clientSecret: intent.client_secret,
    docID: snap,
  };
});

const calculateOrderAmount = (data) => {
  let subtotal = 0;
  let total = 0;
  const transactionFee = 500;
  const tax = 1.05;
  if (data[0] != undefined) {
    for (const item of data) {
      subtotal += item.price * item.quantity;
    }
    total = Math.round(subtotal * 100 * tax) + transactionFee;
    return total;
  }
  return 1400;
};

const removeUnnecessaryProductDetails = (products) => {
  if (products[0] != undefined) {
    const scrubedProducts = [];
    for (const prod of products) {
      if (prod.room != undefined) {
        // all day pass
        if (prod.room == null) {
          delete prod.room;
          delete prod.time;
          scrubedProducts.push(prod);
        } else {
          // 90 minute room pass
          delete prod.room.photo;
          scrubedProducts.push(prod);
        }
      } else if (prod.type == "addon") {
        // addons
        delete prod.duration;
        delete prod.timeSlot;
        scrubedProducts.push(prod);
      }
    }
    return scrubedProducts;
  }
  return "No Products Selected";
};

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  console.log(`**************************************`);
  console.log({ data, stripe });
  const products = data.order.products;
  const orderProducts = removeUnnecessaryProductDetails(data.order.products);
  data.order.products = orderProducts;

  // const customer = JSON.stringify(data.customer);
  // const order = JSON.stringify(data.order);
  // const participants = JSON.stringify(data.participants);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(products),
    // amount: 1400,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      docID: data.docID,
      // customer: customer,
      // order: order,
      // participants: participants,
    },
  });

  console.log({ paymentIntent });

  return {
    clientSecret: paymentIntent.client_secret,
  };
});

exports.events = functions.https.onRequest((request, response) => {
  const sig = request.headers["stripe-signature"];

  try {
    // Validate the request
    const event = stripeWebhook.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    );

    // Add the event to the database`
    return admin
      .database()
      .ref("/events")
      .push(event)
      .then((snapshot) => {
        // Return a successful response to
        // acknowledge the event was processed successfully
        return response.json({
          received: true,
          ref: snapshot.ref.toString(),
        });
      })
      .catch((err) => {
        // Catch any errors saving to the database
        console.error(err);
        return response.status(500).end();
      });
  } catch (err) {
    // Signing signature failure, return an error 400
    return response.status(400).end();
  }
});

const eachCellTime = (time, plus) => {
  const hr = time?.split(":")[0];
  const min = time?.split(":")[1];
  const inseconds = hoursToSeconds(hr) + minutesToSeconds(min) + plus * 1800;
  const newtime = secondsToHours(inseconds);
  if (inseconds % 3600 != 0) {
    return newtime + ":" + secondsToMinutes(inseconds % 3600);
  }
  return newtime + ":00";
};

const generateImpactedTime = (duration, time) => {
  const sesArr = [];
  for (let x = -duration / 30 + 1; x < duration / 30; x++) {
    sesArr.push(eachCellTime(time, x));
  }
  return sesArr;
};

exports.getRemainingCapacity = functions.https.onCall(async (data, context) => {
  // const msg = {
  //   to: "marge.consunji@gmail.com",
  //   from: "mentorshipteamblue@gmail.com",
  //   subject: "Hopper - Booking Confirmation",
  //   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  //   templateId: "d-da2e6b3a1b434600aefd89e11ead3048",
  //   dynamicTemplateData: {
  //     firstname: "Marge",
  //   },
  // };

  // sgMail
  //     .send(msg)
  //     .then(() => {
  //       console.log("Email sent");
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  try {
    const date = data.date;
    const bookingSnapshot = await admin
      .firestore()
      .collection("bookings")
      .where("order.bookingDate", "==", date)
      .get();
    const bookingData = bookingSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    const productSnapshot = await admin
      .firestore()
      .collection("products")
      .where("type", "==", "product")
      .get();
    const roomsData = {};
    const rooms = await admin.firestore().collection("rooms").get();
    rooms.docs.forEach((doc) => {
      roomsData[doc.id] = { ...doc.data() };
    });

    const productData = productSnapshot.docs.map((doc) => {
      const { room, ...rest } = doc.data();

      return {
        id: doc.id,
        ...rest,
        room: roomsData[room] || null,
      };
    });

    const timeSnapshot = await admin
      .firestore()
      .collection("opentime")
      .where("date", "==", date)
      .get();
    const timeData = timeSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    const open = timeData.length == 0 ? "09:00" : timeData[0]?.open;
    const close = timeData.length == 0 ? "21:00" : timeData[0]?.close;
    const cell = [];
    const openHour = new Date(`${date}T${open}:00Z`);
    const closeHour = new Date(`${date}T${close}:00Z`);
    const totalOpenTime = closeHour.getTime() - openHour.getTime();
    const noOfCells = millisecondsToMinutes(totalOpenTime) / 30;
    for (let i = 0; i < noOfCells; i++) {
      cell.push(eachCellTime(open, i));
    }

    const finalObj = {};
    for (const prod of productData) {
      const bookedProduct = [];
      for (const booking of bookingData) {
        if (booking.status.type == "SUCCESS") {
          for (const product of booking.order.products) {
            if (product.room?.name == prod?.room.name) {
              bookedProduct.push(product);
            } else if (product.room == null && product.title == "All Day Pass") {
              bookedProduct.push(product);
            }
          }
        }
      }
      const productArr = [];
      for (const [index, sess] of cell.entries()) {
        let originalCellCapacity = prod?.room.capacity;
        if (prod.title.includes("All")) {
          const impactedTimeSlot = cell;
          const impactedCapacityArr = [];
          for (const slot of impactedTimeSlot) {
            let slotCapacity = prod?.room.capacity;
            for (const p of bookedProduct) {
              const session = [];
              for (let i = 0; i < p.duration / 30; i++) {
                session.push(eachCellTime(p.time, i));
              }
              if (session.includes(slot) || p.title.includes("All")) {
                slotCapacity -= p.quantity;
              }
            }
            impactedCapacityArr.push(slotCapacity);
          }
          originalCellCapacity = Math.min(...impactedCapacityArr);
        } else {
          const impactedTimeSlot = generateImpactedTime(prod.duration, sess);
          const impactedCapacityArr = [];
          for (const slot of impactedTimeSlot) {
            let slotCapacity = prod?.room.capacity;
            for (const p of bookedProduct) {
              const session = [];
              for (let i = 0; i < p.duration / 30; i++) {
                session.push(eachCellTime(p.time, i));
              }
              if (session.includes(slot) || p.title.includes("All")) {
                slotCapacity -= p.quantity;
              }
            }
            impactedCapacityArr.push(slotCapacity);
          }
          originalCellCapacity = Math.min(...impactedCapacityArr);
        }
        productArr.push({
          idx: index,
          time: sess,
          remainingCapacity: originalCellCapacity,
        });
      }
      finalObj[`${prod.id}`] = productArr;
    }
    return finalObj;
  } catch (error) {
    return error;
  }
});

const createWaiversInDB = async (bookingId) => {
  try {
    // eslint-disable-next-line max-len
    const snapshot = await admin
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .get();

    // eslint-disable-next-line max-len
    const bookingData = snapshot ? { docID: snapshot.id, ...snapshot.data() } : null;
    const participants = bookingData.participants;
    const updatedParticipants = [];

    for (const participant of participants) {
      const waiver = {
        fullName: participant.fullName,
        bookingId,
      };

      const docRef = await admin.firestore().collection("waivers").add(waiver);

      updatedParticipants.push({
        waiverId: docRef.id,
        fullName: waiver.fullName,
      });
    }

    return updatedParticipants;
  } catch (error) {
    // eslint-disable-next-line no-undef
    return response.status(400).end();
  }
};

const updateBookingWithWaiversInDB = async (bookingId, updatedParticipants) => {
  try {
    await admin.firestore().collection("bookings").doc(bookingId).update({
      participants: updatedParticipants,
    });
  } catch (error) {
    // eslint-disable-next-line no-undef
    return response.status(400).end();
  }
};

const sendConfirmationEmail = async (docID) => {
  // eslint-disable-next-line max-len
  const snapshot = await admin.firestore().collection("bookings").doc(docID).get();

  const orderDetails = snapshot.data();
  console.log("orderdetails", orderDetails);

  const { email, first, last } = orderDetails.customer;
  const { bookingDate, products } = orderDetails.order;
  const { amount, confirmDate, transactionID } = orderDetails.stripe;
  const participants = orderDetails.participants;
  const formattedConfirmDate = confirmDate.split("GMT+0000")[0];
  const formattedAmount = (amount / 100).toFixed(2);

  const baseUri = "https://team-blue-8951b.web.app/waiver";

  const waiverList = participants
    ?.map(
      ({ fullName, waiverId }) => `
  <li>${fullName} -
  <a href="${baseUri}/docId/waiverId">
  ${baseUri}/${docID}/${waiverId}</a></li>`
    )
    .join("");

  const waiverSection = participants.length
    ? `<div>
  <h3>Waiver Forms</h3>
  <p>In case you're jumping with 
  other people, here's a list of
  waiver form links to send to everyone in your party.</p>
  <ol>
  ${waiverList}
  </ol>
  </div>`
    : "";

  const productList = products
    .map(({ title, price, quantity, time, timeSlot }) => {
      if (time) {
        return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid gainsboro;">
          <p style="margin-bottom: 3px;">${title}</p>
            <small style="color: grey; 
            font-size: 13px">Booking Time: ${time}</small>
        </td>
        <td style="text-align: center; 
        border-bottom: 1px solid gainsboro;">
        ${quantity}</td>
        <td style="text-align: center; 
        border-bottom: 1px solid gainsboro;">
        ${price}</td>
      </tr>`;
      } else {
        return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid gainsboro;">
          <p style="margin-bottom: 3px;">${title}</p>
        </td>
        <td style="text-align: center; 
        border-bottom: 1px solid gainsboro;">${quantity}</td>
        <td style="text-align: center; 
        border-bottom: 1px solid gainsboro;">${price}</td>
      </tr>`;
      }
    })
    .join("");

  const msgBody = `<html>
  <head>
    <title></title>
  </head>
  <body>
  <div style="max-width: 550px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
  color:black;
  font-size:14px;
  line-height:20px; padding:16px 16px 16px 16px;">
          <div style="margin-bottom: 50px">
              <h2>Hi there, ${first}!</h2>
              <p>Thank you for booking an event with us at Hopper.</p>
              <p>If you're jumping as a group, 
              we recommend you have everyone 
              sign their waiver forms ahead of time.
              You'll find individual links below for each waiver form.</p>
          </div>

          <h2>Your Booking</h2>
          <div style="background-color: #F5F5F5; padding: 4px;">
              <ul style="list-style: none;
              margin-left: 0; padding-left: 10px; width: 100%;">
                  <li><b>Billed To:</b>${first} ${last}
                  </li>
                  <li><b>Receipt No.</b> ${transactionID}</li>
                  <li><b>Confirmation Date:</b> ${formattedConfirmDate}</li>
                  <li><b>Order Total:</b> $${formattedAmount}</li>
              </ul>
          </div>
          <div style="margin-bottom: 10px;">
            <h3>Your Booking Details</h3>
            <p><b>Booking Date: ${bookingDate}</b></p>
          </div>
              <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                  <tr>
                      <th style="text-align: left;
                      padding: 10px;
                      border-bottom: 1px solid gainsboro">
                      Product
                      </th>
                      <th style="padding: 10px; border-bottom: 
                      1px solid gainsboro">
                      Quantity
                      </th>
                      <th style="padding: 10px;  border-bottom: 
                      1px solid gainsboro">
                      Price
                      </th>
                  </tr>
                  ${productList}
              </tbody>
          </table>
          <div style="text-align: right;">
          <p style="font-size: 19px;"><b>Total</b>: $${formattedAmount}</p>
          </div>
          ${waiverSection}
      </div>
  </body>
</html>`;

  const msg = {
    to: `${email}`,
    from: "p.bergstroem@gmail.com",
    subject: `Hopper - Booking Confirmation for ${first} ${last}`,
    text: "Booking Confirmation Details",
    html: msgBody,
  };

  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

exports.stripeConfirmAddToDB = functions.database
  .ref("/events/{eventId}")
  .onCreate(async (snapshot, context) => {
    const metadata = snapshot.val().data.object.metadata;
    const docID = metadata.docID;

    // const customer = metadata.customer;
    // const order = metadata.order;
    // const participants = metadata.participants;

    // const parsedCustomer = JSON.parse(customer);
    // const parsedOrder = JSON.parse(order);
    // const parsedParticipants = JSON.parse(participants);

    const amount = snapshot.val().data.object.amount_received;
    const transactionID = snapshot.val().data.object.id;
    const receiptURL = snapshot.val().data.object.charges.data[0].receipt_url;
    const unixTime = snapshot.val().created;
    const milliseconds = unixTime * 1000;
    const dateObject = new Date(milliseconds);
    const dbTime = dateObject.toString();
    await admin
      .firestore()
      .collection("bookings")
      .doc(docID)
      .update({
        // customer: parsedCustomer,
        // order: parsedOrder,
        // participants: parsedParticipants,
        stripe: {
          amount: amount,
          receiptURL: receiptURL,
          transactionID: transactionID,
          confirmDate: dbTime,
        },
        status: {
          type: "SUCCESS",
          text: "",
        },
      });

    const updatedParticipants = await createWaiversInDB(docID);

    await updateBookingWithWaiversInDB(docID, updatedParticipants);

    await sendConfirmationEmail(docID);

    return console.log({
      eventId: context.params.eventId,
      data: snapshot.val().data.object.metadata.docID,
    });
  });

// exports.calculateSessionCapacity = functions.https
//     .onCall(async (data, context) => {
//       return {
//         test: "hello",
//       };
//       const date = data.date;
//       const bookingSnapshot = await admin.firestore()
//           .collection("bookings")
//       .where("order.bookingDate", "==", date).get();
//       const bookingData = bookingSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       const productData = await fetchAllProductsFromDb();
//       return {
//         bookingData,
//         productData,
//       };
//     });
