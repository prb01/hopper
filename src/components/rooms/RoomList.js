import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRooms } from "redux/room";
import { Table } from "reactstrap";

const RoomList = (props) => {
  const dispatch = useDispatch();

  const { data, isLoaded, hasErrors } = useSelector((state) => state.room);

  useEffect(() => {
    dispatch(fetchAllRooms());
  }, [dispatch]);

  return (
    <section>
      {!isLoaded && "Rooms loading..."}
      {hasErrors && "Error Loading"}
      {isLoaded && (
        <Table striped>
          <thead>
            <tr>
              <th>#</th>
              <th>Room Name</th>
              <th>Room Capacity</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              return (
                <tr key={item.id}>
                  <th scope="row">{index + 1}</th>
                  <td>{item.name}</td>
                  <td>{item.capacity}</td>
                  <td>
                    <img
                      src={item.photo}
                      alt="Room Image"
                      style={{ height: "100px" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </section>
  );
};

export default RoomList;
