export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#136dec', // MATCHING REFERENCE
                    600: '#2563eb',
                    700: '#1d4ed8',
                    DEFAULT: '#136dec',
                },
                "background-light": "#f6f7f8",
                "background-dark": "#101822",
                "surface-dark": "#233348",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "sans": ["Inter", "sans-serif"],
            },
            borderRadius: {
                "lg": "0.5rem",
                "xl": "0.75rem",
            }
        },
    },
    plugins: [],
}
