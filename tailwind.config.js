/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: "#B34700",
        tinta: "#2B221A",
        apoio: "#8A7A6A",
        fundo: "#FAF6F1",
        linha: "#EAE0D3",
        sucesso: "#1E8449",
        erro: "#C0392B",
        aviso: "#B7791F",
      },
    },
  },
  plugins: [],
};
