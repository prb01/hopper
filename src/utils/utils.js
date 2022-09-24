import firebaseClient from "firebase/client";

export async function _deleteBookingsByDate(dateString) {
  const snapshot = await firebaseClient
    .firestore()
    .collection("bookings")
    .where("order.bookingDate", "==", dateString)
    .get()

  const docs = snapshot.docs

  console.log(`DELETING ${docs.length} BOOKINGS BY DATE`)

  docs.forEach(doc => {
    doc.ref.delete()
    console.log(`deleted ${doc.id}`)
  })
}