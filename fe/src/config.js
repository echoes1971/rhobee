// Configuration loader
// Prioritize runtime config (window.env) over build-time config (process.env)

const getConfig = () => {
  // In production with Docker, window.env will be injected at runtime
  // In development, fall back to process.env
  const config = {
    siteTitle: window.env?.REACT_APP_SITE_TITLE || process.env.REACT_APP_SITE_TITLE || 'R-Project',
    apiEndpoint: window.env?.REACT_APP_ENDPOINT || process.env.REACT_APP_ENDPOINT || '/api'
  };

  console.log('Loaded config:', config);
  return config;
};

export default getConfig();
