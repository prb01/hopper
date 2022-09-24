import { format } from 'date-fns';
import React, {useEffect, useState} from 'react'
import { millisecondsToMinutes, minutesToSeconds, secondsToHours, secondsToMinutes } from 'date-fns';
import hoursToSeconds from 'date-fns/hoursToSeconds';

export default function CalendarCell(props) {
    const { cellValue, productdata, roomdata, currentRoom, bookingdata, datepick} = props;
    const [cellCapacity, setCellCapacity ] = useState(currentRoom.capacity);
    const dateFilter = bookingdata.filter((value) => {
        return (value.order.bookingDate == format(datepick, 'yyyy-MM-dd'))
    })

    const arr = []
    for (let booking of dateFilter) {
        for (let product of booking.order.products) {
            if (product.room?.name == currentRoom.name) {
                arr.push(product)
            } else if (product.room == null && product.title == 'All Day Pass') {
                arr.push(product)
            }
        }
    }
useEffect(() => {
    setCellCapacity(currentRoom.capacity)
    calculate()
}, [datepick])

const calculate = () => {
    for (let prod of arr) {
        const session  = []
        for (let i=0; i< prod.duration / 30; i++) {
            session.push(eachCellTime(prod.time, i))
        }
        if (session.includes(cellValue) || prod.title.includes('All')) {
            setCellCapacity((cellCapacity) => cellCapacity - prod.quantity)
        }
    }
}


    function eachCellTime(time, plus) {
        let hr = time?.split(':')[0];
        let min = time?.split(':')[1];
        let inseconds = hoursToSeconds(hr) + minutesToSeconds(min) + plus * 1800;
        let newtime = secondsToHours(inseconds)
        if (inseconds % 3600 != 0) {
            return newtime +":"+ secondsToMinutes(inseconds % 3600)
        }
        return newtime+ ':00'
    }

    const mouseOver = (e) => {
        e.target.style.border = "1.5px solid #2e1766";
    }
    const mouseOut = (e) => {
        e.target.style.border = '';
    }





    return (
        <td 
            onMouseOver={mouseOver} onMouseOut={mouseOut}
            id={`${cellCapacity >= currentRoom.capacity * 0.5 ? 'available' : ''}`}
            className={`p-0 
            ${cellCapacity > 0 && cellCapacity < currentRoom.capacity * 0.5 ? 'halfbooked' : ''} 
            ${cellCapacity < 0 ? 'overbooked' : ''}
        `}>
            <div 
                className={`cell 
                ${cellCapacity < 0 || cellCapacity == 0 ? 'display' : ''}
               
            `}>
                {cellCapacity == 0 ? "All Occupied" : (cellCapacity < 0 ? "Over booked" : `available spot ${cellCapacity}`)}

            </div>
        </td>
    )
}