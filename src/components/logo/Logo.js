import { useRef } from 'react';

const Logo = () => {
  const logoLetters = [...'HOPPER'];
  const letterRefs = useRef([]);

  const jump = (target) => {
    target.classList.add('jump');
    target.addEventListener('animationend', () => {
      chill(target);
    });
  };

  const chill = (target) => {
    target.classList.remove('jump');
  };

  return (
    <div id="logo">
      {logoLetters.map((letter, i) => (
        <span
          key={i}
          className="logo-letter"
          ref={(elem) => {
            letterRefs.current[i] = elem;
          }}
          onMouseOver={() => jump(letterRefs.current[i])}
        >
          {letter}
        </span>
      ))}
    </div>
  );
};

export default Logo;
