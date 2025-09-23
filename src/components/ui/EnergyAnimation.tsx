"use client";

import React from 'react';
import Lottie from 'lottie-react';

interface EnergyAnimationProps {
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const EnergyAnimation: React.FC<EnergyAnimationProps> = ({ 
  className = "", 
  loop = true, 
  autoplay = true 
}) => {
  // Simple energy pulse animation data
  const energyAnimationData = {
    "v": "5.5.7",
    "fr": 30,
    "ip": 0,
    "op": 90,
    "w": 200,
    "h": 200,
    "nm": "Energy Pulse",
    "ddd": 0,
    "assets": [],
    "layers": [
      {
        "ddd": 0,
        "ind": 1,
        "ty": 4,
        "nm": "Pulse 1",
        "sr": 1,
        "ks": {
          "o": {
            "a": 1,
            "k": [
              {"t": 0, "s": [0]},
              {"t": 30, "s": [100]},
              {"t": 60, "s": [0]}
            ],
            "ix": 11
          },
          "r": {"a": 0, "k": 0, "ix": 10},
          "p": {"a": 0, "k": [100, 100, 0], "ix": 2},
          "a": {"a": 0, "k": [0, 0, 0], "ix": 1},
          "s": {
            "a": 1,
            "k": [
              {"t": 0, "s": [0, 0, 100]},
              {"t": 30, "s": [100, 100, 100]},
              {"t": 60, "s": [150, 150, 100]}
            ],
            "ix": 6
          }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "el",
            "p": {"a": 0, "k": [0, 0], "ix": 3},
            "s": {"a": 0, "k": [30, 30], "ix": 2},
            "d": 1,
            "ix": 2
          },
          {
            "ty": "fl",
            "c": {
              "a": 0,
              "k": [0.345, 0.855, 0.694, 0.6],
              "ix": 4
            },
            "o": {"a": 0, "k": 100, "ix": 5},
            "r": 1,
            "ix": 3
          }
        ],
        "ip": 0,
        "op": 90,
        "st": 0,
        "bm": 0
      },
      {
        "ddd": 0,
        "ind": 2,
        "ty": 4,
        "nm": "Pulse 2",
        "sr": 1,
        "ks": {
          "o": {
            "a": 1,
            "k": [
              {"t": 0, "s": [0]},
              {"t": 30, "s": [100]},
              {"t": 60, "s": [0]}
            ],
            "ix": 11
          },
          "r": {"a": 0, "k": 0, "ix": 10},
          "p": {"a": 0, "k": [100, 100, 0], "ix": 2},
          "a": {"a": 0, "k": [0, 0, 0], "ix": 1},
          "s": {
            "a": 1,
            "k": [
              {"t": 0, "s": [0, 0, 100]},
              {"t": 45, "s": [100, 100, 100]},
              {"t": 90, "s": [150, 150, 100]}
            ],
            "ix": 6
          }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "el",
            "p": {"a": 0, "k": [0, 0], "ix": 3},
            "s": {"a": 0, "k": [20, 20], "ix": 2},
            "d": 1,
            "ix": 2
          },
          {
            "ty": "fl",
            "c": {
              "a": 0,
              "k": [0.545, 0.361, 0.902, 0.4],
              "ix": 4
            },
            "o": {"a": 0, "k": 100, "ix": 5},
            "r": 1,
            "ix": 3
          }
        ],
        "ip": 0,
        "op": 90,
        "st": 15,
        "bm": 0
      }
    ],
    "markers": []
  };

  return (
    <div className={className}>
      <Lottie 
        animationData={energyAnimationData} 
        loop={loop} 
        autoplay={autoplay} 
      />
    </div>
  );
};