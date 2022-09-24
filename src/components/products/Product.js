const Product = ({ product, idx}) => {
  return (
    <tbody>
      <tr>
        <th scope="row">{idx + 1}</th>
        <td>
          <img src={product.photo} alt="Room Image" style={{ height: "100px" }} />
        </td>
        <td>{product.title}</td>
        <td>{product.type}</td>
        <td>{product.price}</td>
        <td>{product.status}</td>
        <td>{product.room?.name}</td>
        <td>{product.duration >= 0 ? product.duration : ""}</td>
      </tr>
    </tbody>
  );
}

export default Product