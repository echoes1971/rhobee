// Get runtime config (from window.env injected by Docker) or fallback to build-time config
const getRuntimeConfig = (key, fallback) => {
    // alert("app.cfg.js: getRuntimeConfig key=" + key + " window.env?.[key]=" + window.env?.[key] + " process.env[key]=" + process.env[key] + " fallback=" + fallback);
    const window_env = window.env?.[key] || "";
    return (window_env>"" && window_env.indexOf("${")=== -1 ? window.env?.[key] : null) || process.env[key] || fallback;
};

export const app_cfg = {
    site_title: getRuntimeConfig('REACT_APP_SITE_TITLE', 'R-Prj'),
    endpoint: getRuntimeConfig('REACT_APP_ENDPOINT', '/api'),
    app_home_object_id: getRuntimeConfig('REACT_APP_HOME_OBJECT_ID', '-10')
};
