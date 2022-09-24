const WizardStep = ({ stepHeader, children }) => {
  return (
    <div className="mb-4">
      <h3>{stepHeader}</h3>
      <div>{children}</div>
    </div>
  );
};

export default WizardStep;
