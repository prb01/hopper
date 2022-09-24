import WizardStep from "components/checkout/wizard-parts/WizardStep";
import Participants from "../Participants/Participants";

const Waiver = () => {
  return (
    <WizardStep stepHeader="Add Event Participants">
      <p>All participants must sign a digital waiver before entering the park. Add each participants name below and you'll get links to individual digital waivers emailed to you upon checkout.</p>
      <Participants />
    </WizardStep>
  );
};

export default Waiver;
