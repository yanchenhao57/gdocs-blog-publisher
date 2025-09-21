import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			backgroundDark: '#000000',
  			backgroundSecondary: '#fafafa',
  			backgroundSecondaryDark: '#111111',
  			text: '#000000',
  			textLight: '#ffffff',
  			textSecondary: '#666666',
  			textSecondaryLight: '#cccccc',
  			textMuted: '#999999',
  			textMutedLight: '#888888',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			primaryHover: '#cc0000',
  			primaryActive: '#990000',
  			primaryLight: '#ff3333',
  			primaryDark: '#b30000',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			accentHover: '#cc0029',
  			accentLight: '#ff1a4d',
  			accentDark: '#b30026',
  			border: 'hsl(var(--border))',
  			borderDark: '#333333',
  			borderLight: '#f0f0f0',
  			borderStrong: '#d0d0d0',
  			borderStrongDark: '#444444',
  			success: '#00ff00',
  			successHover: '#00cc00',
  			error: '#ff0000',
  			errorHover: '#cc0000',
  			warning: '#ff6600',
  			warningHover: '#cc5200',
  			hover: '#f5f5f5',
  			hoverDark: '#1a1a1a',
  			active: '#e0e0e0',
  			activeDark: '#2a2a2a',
  			overlay: 'rgba(0, 0, 0, 0.5)',
  			overlayLight: 'rgba(0, 0, 0, 0.1)',
  			shadow: 'rgba(0, 0, 0, 0.1)',
  			shadowDark: 'rgba(255, 255, 255, 0.1)',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'sans-serif'
  			],
  			mono: [
  				'SF Mono',
  				'Monaco',
  				'Inconsolata',
  				'Roboto Mono',
  				'monospace'
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem'
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			sharp: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  			'sharp-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			glow: '0 0 20px rgba(255, 0, 0, 0.3)',
  			'glow-lg': '0 0 40px rgba(255, 0, 0, 0.4)'
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			glow: 'glow 2s ease-in-out infinite alternate'
  		},
  		keyframes: {
  			glow: {
  				'0%': {
  					boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
  				},
  				'100%': {
  					boxShadow: '0 0 40px rgba(255, 0, 0, 0.6)'
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ["class", "class"],
};

export default config;
