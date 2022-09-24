import React from 'react'
import { faCalendar, faTag, faTh, faCog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Col, ListGroup, ListGroupItem } from "reactstrap"
import "../dashboard/Dashboard.css"
import SidebarCollapse from './SidebarCollapse'

const sidebarItems = [
    {
        id: 0,
        text: 'Products',
        icon: <FontAwesomeIcon icon={faTag} />,
        path: '/admin',
        collapse: [
            {
                text: 'All products',
                path: '/admin/products'
            },
            {
                text: 'Create product',
                path: '/admin/createproduct'
            },
        ]
    },
    {
        id: 1,
        text: 'Bookings',
        icon: <FontAwesomeIcon icon={faCalendar} />,
        path: '/admin',
        collapse: [
            {
                text: 'All bookings',
                path: '/admin/bookings'
            },
            {
                text: 'Create Opentimes',
                path: '/admin/createopentime'
            },
            {
                text: 'Calendar View',
                path: '/admin/calendarview'
            },
        ]
    },
    
    {
        id: 2,
        text: 'Rooms',
        icon: <FontAwesomeIcon icon={faTh} />,
        path: '/admin',
        collapse: [
            {
                text: 'All Rooms',
                path: '/admin/rooms'
            },
            {
                text: 'Create rooms',
                path: '/admin/createroom'
            },
        ]
    },
]



export default function Sidebar(props) {
    
    const mouseover = (e) => {
        e.target.style.background = "#0a0b0c";
    }
    const onMouseOut = (e) => {
        e.target.style.background = "";
    }


    return (
    <Col className="sidebar p-0 bg-dark border-0 text-white" xs="2">
            <ListGroup className="text-white mt-3 fa-ul">
                <SidebarCollapse item={sidebarItems[0]} mouseover={mouseover} onMouseOut={onMouseOut}/>

                <SidebarCollapse item={sidebarItems[1]} mouseover={mouseover} onMouseOut={onMouseOut}/>

                <SidebarCollapse item={sidebarItems[2]} mouseover={mouseover} onMouseOut={onMouseOut}/>
                
                <ListGroupItem onMouseOver={mouseover} onMouseOut={onMouseOut} className="bgdark border-0">
                            <span className="fa-li"><FontAwesomeIcon icon={faCog} /></span>Settings
                </ListGroupItem>

            </ListGroup>
    </Col>
  )
}
