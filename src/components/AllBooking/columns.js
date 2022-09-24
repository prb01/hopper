import { Link } from "react-router-dom"

import React, {useState} from 'react'
import { Badge } from "reactstrap"
import { format, formatISO } from "date-fns"

export const COLUMNS = [
    {
        Header: "BOOKING ID",
        accessor: "id",
        Cell: ({ value }) => { return <Link to={`/admin/bookings/${value}`}>{value}</Link>  }
    },
    {
        Header: "BOOKING DATE",
        accessor: row => { return formatISO(new Date(row.order.bookingDate))},
        Cell: ({ value }) => format(new Date(value), 'M/d/yyyy')
    },
    {
        Header: "SESSION TIME",
        accessor: row => {
            let session = []
            row.order.products.map(product => {
                if (product.type == 'product') {
                    session.push(product?.time)
                }
            })
            return session
        },
        Cell: ({value}) => 
        value.map(time  => {
            return <Badge className='mr-2 py-2' color="info" pill>{time}</Badge>
        }),
        sortType: "customTimeSort"
    },
    {
        Header: "HEADCOUNT",
        accessor: "participants.length"
    },
    {
        Header: "AMOUNT",
        accessor: row => {
            let total = row?.order.products.reduce(
                (sum, { price, quantity }) => sum + price * quantity,
                0
            )
        return total;
        }
    },
    {
        Header: "BOOKING NAME",
        accessor: row => `${row.customer?.first} ${row.customer?.last}`
    },
    {
        Header: "STATUS",
        accessor: 'status.type',
        Cell: ({value}) => {
            if (value == 'SUCCESS') {
                return <span className='text-success'>{value}</span>
            }
            return <span>{value}</span>
        }
        
    },
]

// const customTimeSort = (rowA, rowB, id, desc) => {
//     // console.log(rowA.values[id])
//     let valueA = rowA.values[id].sort()[rowA.values[id].length - 1];
//     let valueB = rowB.values[id].sort()[rowA.values[id].length - 1];
//     // console.log(valueA, valueB)
//     if (valueA == '' || valueA == undefined ) {
//       valueA = desc ? "ZZZZZZZ" : "0000000";
//     }
//     if (valueB == '' || valueB == undefined ) {
//       valueB = desc ? "ZZZZZZ" : "0000000";
//     }
//     // console.log(rowA.values[id].sort()[rowA.values[id].length - 1])
//     console.log(valueA < valueB, valueA, valueB)
//     if (valueA >valueB) return -1;
//     if (valueB > valueA) return 1;
//      return 0;
// }