import React, { useRef, useEffect, useState } from 'react';

const SvgDisplay = React.forwardRef((props, ref) => {
  const [svgElement, setSvgElement] = useState(null);

  useEffect(() => {
    if (ref.current) {
      const svg = ref.current.querySelector('svg');
      if (svg) {
        setSvgElement(svg);
      } else {
        console.error('No SVG element found');
      }
    } else {
      console.error('No SVG ref found');
    }
  }, [ref]);

  return (
    <div ref={ref}>
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" stroke="black" strokeWidth="3" fill="red" />
        <text x="50%" y="50%" textAnchor="middle" stroke="#51c5cf" strokeWidth="1px" dy=".3em">Hello SVG</text>
      </svg>
    </div>
  );
});

export default SvgDisplay;