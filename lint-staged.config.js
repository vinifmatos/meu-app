module.exports = {
  "backend/**/*.rb": (files) => {
    return `bundle exec rubocop -A ${files.join(" ")}`;
  },
  "frontend/src/**/*.{ts,html}": (files) => {
    return `yarn workspace meu-app run lint --fix ${files.join(" ")}`;
  },
  "frontend/src/**/*.scss": (files) => {
    return `yarn workspace meu-app run lint:style --fix ${files.join(" ")}`;
  },
  "frontend/src/**/*.{ts,html,scss,json}": (files) => {
    return `yarn workspace meu-app run format ${files.join(" ")}`;
  },
};
