import React from 'react';
import bg_screen from "./images_for_template/Макет.png";
import lev from "./images_for_template/левое.png";
import pre from "./images_for_template/правое.png";
import left_word from "./images_for_template/word_left.png";
import right_word from "./images_for_template/word_right.png";

export default function TemplateSimple({ images, svgRef }) {
    return (
        <div ref={svgRef}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="400px" height="600px" version="1.1"
                style={{
                    shapeRendering: 'geometricPrecision',
                    textRendering: 'geometricPrecision',
                    imageRendering: 'optimizeQuality',
                    fillRule: 'evenodd',
                    clipRule: 'evenodd'
                }}
                viewBox="0 0 1240 1844"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <defs>
                    <pattern id="background" patternUnits="userSpaceOnUse" width="1240" height="1844">
                        <image className='str0' xlinkHref={bg_screen} width="1240" height="1844" />
                    </pattern>
                    <style type="text/css">
                        {`
                        .str0 {stroke:#FEFEFE;stroke-width:6.25;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.9256}
                        .fil2 {fill:none}
                        .fil4 {fill:none;fill-rule:nonzero}
                        .fil0 {fill:#FEFEFE}
                        .fil3 {fill:#FEFEFE}
                        .fil1 {fill:#FEFEFE;fill-rule:nonzero}
                        .fil5 {fill:#2E2E2D;fill-rule:nonzero}
                        `}
                    </style>
                    <clipPath id="id0">
                        <path d="M0 0l1240 0 0 1844 -1240 0 0 -1844z"/>
                    </clipPath>
                </defs>
                <rect width="100%" height="100%" fill="url(#background)" />
                <g id="Слой_x0020_1">
                    <image className="fil3" x="48" y="48" width="530" height="489.23" href={images[0].url} preserveAspectRatio="xMidYMid slice"/>
                    <image className="fil3" x="662.6" y="48" width="530" height="489.23" href={images[0].url} preserveAspectRatio="xMidYMid slice"/>
                    <image className="fil3" x="48" y="585.23" width="530" height="489.23" href={images[1].url} preserveAspectRatio="xMidYMid slice"/>
                    <image className="fil3" x="662.6" y="585.23" width="530" height="489.23" href={images[1].url} preserveAspectRatio="xMidYMid slice"/>
                    <image className="fil3" x="48" y="1122.46" width="530" height="489.23" href={images[2].url} preserveAspectRatio="xMidYMid slice"/>
                    <image className="fil3" x="662.6" y="1122.46" width="530" height="489.23" href={images[2].url} preserveAspectRatio="xMidYMid slice"/>
                    <image x="70" y="1520" className="fil4 str0" href={left_word} />
                    <image x="1035" y="1520" className="fil1" href={right_word} />
                    <image className="fil4 str0" transform="matrix(0.684197 -0.193013 -0.193013 -0.684197 78.5329 1517.83)" x="0" y="0" href={lev} />
                    <image className="fil4 str0" transform="matrix(-0.684197 -0.193013 0.193013 -0.684197 1158.32 1517.83)" x="0" y="0" href={pre} />
                </g>
            </svg>
        </div>
    );
}