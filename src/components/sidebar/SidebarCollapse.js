import React, { useState } from 'react'
import { ListGroupItem, Collapse} from 'reactstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import "./Sidebar.css"



export default function SidebarCollapse(props) {
    const location =  useLocation();
    const [isOpen, setIsOpen] = useState(false);

    
    const toggle = () => {
        setIsOpen(!isOpen)
    }

    const {item, mouseover, onMouseOut } = props;
    return (
        <>
            <ListGroupItem
                onClick={toggle}
                className={`bgdark border-0 ` }
                onMouseOver={mouseover} onMouseOut={onMouseOut}>
                    <span className="fa-li">{item.icon}</span>{item.text}
            </ListGroupItem>
            <Collapse isOpen= {isOpen} >
                {item.collapse.map((item) => (
                 <NavLink key={item.text} className={`text-white ${location.pathname == item.path ? "text-primary" : null}`} tag={Link} to={item.path}>
                    <ListGroupItem  className="ani bgdark border-0" onMouseOver={mouseover} onMouseOut={onMouseOut}>
                    
                        {item.text}
                        
                    </ListGroupItem>
                </NavLink>
                 ))}
            </Collapse>
        </>
    )
}
