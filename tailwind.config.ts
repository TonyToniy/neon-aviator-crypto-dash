import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				neon: {
					blue: '#00f5ff',
					purple: '#8b5cf6',
					green: '#00ff88',
					pink: '#ff0080',
					orange: '#ff6b35'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'plane-curve-flight': {
					'0%': {
						left: '-5%',
						bottom: '10%',
						transform: 'rotate(15deg) scale(1)'
					},
					'25%': {
						left: '25%',
						bottom: '30%',
						transform: 'rotate(10deg) scale(1.1)'
					},
					'50%': {
						left: '50%',
						bottom: '60%',
						transform: 'rotate(5deg) scale(1.2)'
					},
					'75%': {
						left: '75%',
						bottom: '80%',
						transform: 'rotate(0deg) scale(1.1)'
					},
					'100%': {
						left: '105%',
						bottom: '90%',
						transform: 'rotate(-10deg) scale(1)'
					}
				},
				'plane-fly': {
					'0%': {
						transform: 'translateX(-100px) translateY(50px) rotate(0deg)'
					},
					'100%': {
						transform: 'translateX(calc(100vw + 100px)) translateY(-100px) rotate(-15deg)'
					}
				},
				'curved-flight': {
					'0%': {
						left: '-10%',
						bottom: '20%',
						transform: 'rotate(15deg)'
					},
					'25%': {
						left: '25%',
						bottom: '40%',
						transform: 'rotate(10deg)'
					},
					'50%': {
						left: '50%',
						bottom: '60%',
						transform: 'rotate(5deg)'
					},
					'75%': {
						left: '75%',
						bottom: '75%',
						transform: 'rotate(0deg)'
					},
					'100%': {
						left: '110%',
						bottom: '85%',
						transform: 'rotate(-5deg)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(0, 245, 255, 0.8), 0 0 60px rgba(0, 245, 255, 0.4)'
					}
				},
				'number-glow': {
					'0%, 100%': {
						textShadow: '0 0 10px rgba(0, 255, 136, 0.8)'
					},
					'50%': {
						textShadow: '0 0 20px rgba(0, 255, 136, 1), 0 0 30px rgba(0, 255, 136, 0.6)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'plane-curve-flight': 'plane-curve-flight var(--duration) ease-out',
				'plane-fly': 'plane-fly var(--duration) linear',
				'curved-flight': 'curved-flight var(--duration) ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'number-glow': 'number-glow 1s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'slide-in-right': 'slide-in-right 0.3s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'cyber-grid': 'linear-gradient(rgba(0,245,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.1) 1px, transparent 1px)'
			},
			backgroundSize: {
				'grid': '50px 50px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
