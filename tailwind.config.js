/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Arimo', 'Helvetica', 'Arial', 'ui-sans-serif', 'system-ui'],
                mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            colors: {
                base: '#0d0f13',
                accent: '#AE0001', // updated accent red
            },
            boxShadow: {
                glow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 10px 2px rgba(174,0,1,0.34)',
                inset: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            },
            backdropBlur: {
                xs: '2px'
            },
            transitionTimingFunction: {
                'out-soft': 'cubic-bezier(.22,.61,.36,1)'
            },
            keyframes: {
                'pulse-glow': {
                    '0%,100%': { boxShadow: '0 0 0 0 rgba(174,0,1,0.34)' },
                    '50%': { boxShadow: '0 0 0 6px rgba(174,0,1,0)' }
                }
            },
            animation: {
                'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
                'float-slow': 'float 10s ease-in-out infinite',
                'float-medium': 'float 7s ease-in-out infinite',
                'float-fast': 'float 5s ease-in-out infinite'
            }
        },
    },
    plugins: [],
};


