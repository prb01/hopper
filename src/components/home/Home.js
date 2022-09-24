import Logo from 'components/logo/Logo';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-100 h-100 vh-100 d-flex justify-content-center align-items-center homepage-bg">
      <div>
        <Logo />
        <div className="d-flex justify-content-center">
          <Link to="/checkout" className="text-decoration-none">
            <div id="homepage-btn">Buy a Pass</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
