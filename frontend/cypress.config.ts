import { defineConfig } from "cypress";
// import webpackConfig from './webpack.config';

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
      //   webpackConfig,
    },
    specPattern: "cypress/**/*.cy.{js,ts,jsx,tsx}",
  },

  e2e: {
    baseUrl: 'http://localhost:3000', // 👈 Point to your dev server
  },
});
