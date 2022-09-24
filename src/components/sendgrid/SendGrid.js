import { firebase } from "firebase/client";
require("firebase/functions");

const SendGrid = (props) => {
  const handleClick = () => {
    const sendEmail = firebase.functions().httpsCallable("sendEmail");

    sendEmail();
  };
  return (
    <div>
      <button onClick={handleClick}>send email</button>
    </div>
  );
};

export default SendGrid;
