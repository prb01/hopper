import { Row, Col } from 'reactstrap';
import './Dashboard.css';
import AdminNavbar from 'components/navbar/Navbar';
import Sidebar from 'components/sidebar/Sidebar';
import CreateProduct from 'components/products/CreateProduct';
import ProductList from 'components/products/ProductList';
import { Switch, Route } from 'react-router-dom';
import RoomList from 'components/rooms/RoomList';
import CreateRoom from 'components/rooms/CreateRoom';
import AdminBooking from 'components/AdminBooking/AdminBooking';
import BookingView from 'components/AllBooking/BookingView';
import BookingList from 'components/AllBooking/BookingList';
import BookingDetails from 'components/AllBooking/BookingDetails';
import CalendarView from 'components/CalendarView/CalendarView';

const Dashboard = (props) => {
  return (
    <>
      <AdminNavbar />

      <Row className="row-admin">
        <Sidebar />
        <Col className="bg-light content " xs="10">
          <Switch>
            <Route exact path="/admin">
              <div style={{height:  '100%'}} className='d-flex justify-content-center align-items-center'>
                <h1 style={{fontSize: '5rem'}}>Admin area</h1>
              </div>
              
            </Route>
            <Route path="/admin/products">
              <ProductList />
            </Route>
            <Route path="/admin/createproduct">
              <CreateProduct />
            </Route>
            <Route path="/admin/createopentime">
              <AdminBooking />
            </Route>
            <Route path="/admin/calendarview">
              <CalendarView />
            </Route>
            <Route path="/admin/createbooking">
              <AdminBooking />
            </Route>
            <Route exact path="/admin/bookings">
              <BookingList />
            </Route>
            <Route path="/admin/bookings/:id">
              <BookingDetails />
            </Route>
            <Route path="/admin/rooms">
              <RoomList />
            </Route>
            <Route path="/admin/createroom">
              <CreateRoom />
            </Route>
          </Switch>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
