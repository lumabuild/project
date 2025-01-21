import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			terminal: {
  				green: '#1a2f1a',
  				lime: '#4ade80',
  				black: '#0a0f0a',
  				darkgray: '#1a231a'
  			}
  		},
  		fontFamily: {
  			mono: [
  				'Courier New',
  				'monospace'
  			]
  		},
  		animation: {
  			'cursor-blink': 'blink 0.8s step-end infinite',
  			type: 'type 1s steps(50, end)'
  		},
  		keyframes: {
  			blink: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0'
  				}
  			},
  			type: {
  				'0%': {
  					width: '0'
  				},
  				'100%': {
  					width: '100%'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;