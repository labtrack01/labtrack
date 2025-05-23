import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    // App router content
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',

    // Tremor content
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
  	transparent: 'transparent',
  	current: 'currentColor',
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-inter)'
  			]
  		},
  		colors: {
  			tremor: {
  				brand: {
  					faint: colors.blue[50],
  					muted: colors.blue[200],
  					subtle: colors.blue[400],
  					DEFAULT: colors.blue[500],
  					emphasis: colors.blue[700],
  					inverted: colors.white
  				},
  				background: {
  					muted: colors.gray[50],
  					subtle: colors.gray[100],
  					DEFAULT: colors.white,
  					emphasis: colors.gray[700]
  				},
  				border: {
  					DEFAULT: colors.gray[200]
  				},
  				ring: {
  					DEFAULT: colors.gray[200]
  				},
  				content: {
  					subtle: colors.gray[400],
  					DEFAULT: colors.gray[500],
  					emphasis: colors.gray[700],
  					strong: colors.gray[900],
  					inverted: colors.white
  				}
  			},
  			'dark-tremor': {
  				brand: {
  					faint: '#0B1229',
  					muted: colors.blue[950],
  					subtle: colors.blue[800],
  					DEFAULT: colors.blue[500],
  					emphasis: colors.blue[400],
  					inverted: colors.blue[950]
  				},
  				background: {
  					muted: '#131A2B',
  					subtle: colors.gray[800],
  					DEFAULT: colors.gray[900],
  					emphasis: colors.gray[300]
  				},
  				border: {
  					DEFAULT: colors.gray[800]
  				},
  				ring: {
  					DEFAULT: colors.gray[800]
  				},
  				content: {
  					subtle: colors.gray[600],
  					DEFAULT: colors.gray[500],
  					emphasis: colors.gray[200],
  					strong: colors.gray[50],
  					inverted: colors.gray[950]
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
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
  		boxShadow: {
  			'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  			'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  			'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  			'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  		},
  		borderRadius: {
  			'tremor-small': '0.375rem',
  			'tremor-default': '0.5rem',
  			'tremor-full': '9999px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontSize: {
  			'tremor-label': [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			'tremor-default': [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			'tremor-title': [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'tremor-metric': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			]
  		}
  	}
  },
  // @ts-ignore - safelist is valid in Tailwind v4, but types might be lagging
  safelist: [
    // Safelist classes used by Tremor components
    // (You might need to adjust this based on the components you use)
    {
      pattern: /^(bg|text|border|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'dark', 'dark:hover'],
    },
    {
      pattern: /^(dark:)?(bg|text|border|ring)-(transparent|white|black)$/,
       variants: ['hover', 'dark', 'dark:hover'],
    },
    // ... other safelist patterns if needed
  ],
  plugins: [require('@tailwindcss/forms'), require('@tremor/react'), require("tailwindcss-animate")],
};

export default config; 