import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Button, Table } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWaiversByBookingId } from 'redux/waiver';
import { fetchAllBookings, fetchBookingById, getData, getDataSuccess } from 'redux/booking';
import { firebase } from 'firebase/client';
import { format } from 'date-fns';


export default function BookingDetails() {
    const history = useHistory()
    const dispatch = useDispatch();
    const { id } = useParams()
     const {data, isLoaded, hasErrors} = useSelector(state => state.booking)
     const {data: waiverdata } = useSelector(state => state.waiver)

     useEffect(() => {
        const getdata = async () => {
            await dispatch(fetchAllBookings())
            await dispatch(fetchWaiversByBookingId({id : id}))
        }
        getdata()
     }, [])

     console.log(waiverdata)

    console.log(data)
    const bookingdata = data?.filter((booking) => {
        return booking.id == id
    })
     

    return (
        <div className='container'>
            <Button className='back' onClick={() => history.goBack()}>Back</Button>
             <h2 className='mb-5 text-center'>Booking Details for {id}</h2>
             <h5>Products And Addons:</h5>
             <Table borderless>
                 <thead>
                     <tr>
                         <th>Name</th>
                         <th>Type</th>
                         <th>Room</th>
                         <th>Time</th>
                         <th>Duration</th>
                         <th>Quantity</th>
                         <th>{"Price ($)"}</th>
                     </tr>
                 </thead>
                 <tbody>
                     {bookingdata[0]?.order.products.map((product) => {
                        return (
                        <tr key={product.id}>
                            <td>{product.title}</td>
                            <td>{product.type}</td>
                            <td>{product.room?.name ? product.room.name : '-'}</td>
                            <td>{product.time ? product.time: '-'}</td>
                            <td>{product.duration ? product.duration: '-'}</td>
                            <td>{product.quantity}</td>
                            <td>{product.price}</td>
                         </tr>
                         )
                     }) 
                 }
                 </tbody>
             </Table>
             <h5>Customer Infomation</h5>
             <ul>
                 <li className='l-height'><strong className='mr-4'>First Name:</strong> {bookingdata[0]?.customer?.first}</li>
                 <li className='l-height'><strong className='mr-4'>Last Name:</strong> {bookingdata[0]?.customer?.last}</li>
                 <li className='l-height'><strong className='mr-4'>Email:</strong> {bookingdata[0]?.customer?.email}</li>
                 <li className='l-height'><strong className='mr-4'>Zip:</strong> {bookingdata[0]?.customer?.zip}</li>
                 <li className='l-height'><strong className='mr-4'>Address:</strong> {bookingdata[0]?.customer?.address}</li>
             </ul>
             <h5>Checkout Information</h5>
             <ul>
                 <li className='l-height'><strong className='mr-4'>Date:</strong> {bookingdata[0]?.stripe?.confirmDate}</li>
                 <li className='l-height'><strong className='mr-4'>Amount {'($)'}:</strong> {bookingdata[0]?.stripe?.amount / 100}</li>
                 <li className='l-height'><strong className='mr-4'>Receipt Url:</strong> <a href={bookingdata[0]?.stripe?.receiptURL}>{bookingdata[0]?.stripe?.receiptURL}</a></li>
                 <li className='l-height'><strong className='mr-4'>Transcation ID:</strong> {bookingdata[0]?.stripe?.transactionID}</li>
             </ul>
             <h5>Waiver</h5>
             {waiverdata &&  
             <Table borderless>
             <thead>
                 <tr>
                     <th>Date</th>
                     <th>Name</th>
                     <th>Guardian</th>
                     <th>Email</th>
                     <th>IP Address</th>
                     <th>Waiver Url</th>
                     <th>UserAgent</th>
                 </tr>
             </thead>
             <tbody>
                 {waiverdata.map((waiver) => {
                    return (
                    <tr key={waiver.id}>
                        <td>{waiver.date ? waiver.date : '-'}</td>
                        <td>{waiver.name ? waiver.name : waiver.fullName}</td>
                        <td>{waiver.guardian ? waiver.guardian : '-'}</td>
                        <td>{waiver.email ? waiver.email: '-'}</td>
                        <td>{waiver.ipAddress ? waiver.ipAddress: '-'}</td>
                        <td>{waiver.waiverURL ? waiver.waiverURL : '-'}</td>
                        <td>{waiver.userAgent ? waiver.userAgent : '-'}</td>
                     </tr>
                     )
                 }) 
             }
             </tbody>
         </Table>}
            
        </div>
    )
}
