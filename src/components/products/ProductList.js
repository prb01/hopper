import Product from "./Product";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "redux/product";
import { Table } from "reactstrap";

const ProductList = () => {
  const dispatch = useDispatch();
  const { data, isLoaded, hasErrors } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <section>
      {!isLoaded && "Products loading..."}
      {hasErrors && "Error Loading"}
      {isLoaded && (
        <Table striped>
          <thead>
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Title</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
              <th>Room</th>
              <th>Duration</th>
            </tr>
          </thead>
          {data.map((product, idx) => {
            return (
              <Product key={product.id} product={product} idx={idx} />
            )
          })}
        </Table>
      )}
    </section>
  );
};

export default ProductList;
