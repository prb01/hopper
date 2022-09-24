import React from 'react'
import { Navbar, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import "./Navbar.css"
import { useState } from 'react'
import { history } from 'components/app'
import { Link } from 'react-router-dom'

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
        setIsOpen(!isOpen);
  }
  // const mouseover = (e) => {
  //   e.target.style.background = "#0a0b0c";
  // }
  // const onMouseOut = (e) => {
  //   e.target.style.background = "#343a40";
  // }

  return (
    
    <>
        <Navbar
            className='text-white navbar-admin'
            color="dark"
            fixed='top'
            light
            >
            <span>Admin</span>
            <div className="navend">
              
              <Link to="/admin"><FontAwesomeIcon icon={faBell} /></Link>
              <a><FontAwesomeIcon icon={faQuestionCircle} /></a>
              {/* <Button onClick={toggle} className="dominant bg-dark">
              <NavbarText className='nt text-white pt-0 disappear'>Jan3<br/>LoremLoremLorem</NavbarText>
              <FontAwesomeIcon icon={faCaretSquareDown} />
              </Button>
              <Collapse className='passive' isOpen={isOpen}>
                <ListGroup className="text-white">
                    <ListGroupItem onMouseEnter={mouseover} onMouseLeave={onMouseOut} className="matchWidth bgdark border-0" onClick={() => history.push("/login")}>
                      Login
                    </ListGroupItem>
                    <ListGroupItem onMouseEnter={mouseover} onMouseLeave={onMouseOut} className="matchWidth bgdark border-0" onClick={() => history.push("/logout")}>
                      Logout
                    </ListGroupItem>
                </ListGroup>
            </Collapse> */}
              <Dropdown isOpen={isOpen} toggle={toggle}>
                <DropdownToggle className='nt' caret>
                  Account
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => history.push("/logout")} className='text-white nt'>
                    logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              
            </div>
            
        </Navbar>
    </>
  )
}
