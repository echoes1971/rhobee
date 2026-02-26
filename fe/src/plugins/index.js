/**
 * Plugin Registry System
 * Auto-discovers and registers plugins from subdirectories
 */

import i18n from 'i18next';

const plugins = {};
const pluginRoutes = [];
const pluginMenuItems = [];

/**
 * Register a plugin
 * @param {string} name - Unique plugin identifier
 * @param {Object} plugin - Plugin configuration
 * @param {Array} plugin.routes - Routes to add
 * @param {Array} plugin.menuItems - Menu items to add
 * @param {Object} plugin.translations - Namespace translations { en: {}, fr: {}, it: {}, de: {} }
 * @param {Object} plugin.hooks - Lifecycle hooks
 */
export const registerPlugin = (name, plugin) => {
  plugins[name] = plugin;
  console.log(`[Plugin System] Registered: ${name}`);

  // Collect Group ID for plugin activation
  const groupId = plugin.group_id || null;
  plugins[name].group_id = groupId; // Store group ID in plugin config for later use

  // Collect routes
  if (plugin.routes && Array.isArray(plugin.routes)) {
    pluginRoutes.push(...plugin.routes);
  }

  // Collect menu items
  if (plugin.menuItems && Array.isArray(plugin.menuItems)) {
    pluginMenuItems.push(...plugin.menuItems);
  }

  // Register translations
  if (plugin.translations && typeof plugin.translations === 'object') {
    Object.entries(plugin.translations).forEach(([lang, resources]) => {
      if (resources && typeof resources === 'object') {
        i18n.addResourceBundle(lang, `plugin-${name}`, resources, true, true);
        console.log(`[Plugin System] Added translations for ${lang}: plugin-${name}`);
      }
    });
  }

  // Execute hooks
  if (plugin.hooks?.onRegister) {
    plugin.hooks.onRegister();
  }
};

export const getPlugin = (name) => plugins[name];
export const getPluginGroupId = (name) => plugins[name]?.group_id || null;
export const getAllPluginNames = () => Object.keys(plugins).sort();
export const getAllPlugins = () => ({ ...plugins });
export const getPluginRoutes = () => [...pluginRoutes];
export const getPluginMenuItems = () => [...pluginMenuItems];

/**
 * Auto-discover and load all plugins
 * Uses require.context to find all Register.js files in plugin subdirectories
 */
export const initializePlugins = async () => {
  try {
    // Load all Register.js files from plugin subdirectories
    // Pattern explanation:
    // - /\.\/[^/]+\/Register\.js$/: Matches only Register.js in immediate subdirectories
    const context = require.context('./', true, /\.\/[^/]+\/Register\.js$/);
    
    // Get all matching module paths
    const modules = context.keys();
    console.log(`[Plugin System] Found ${modules.length} plugin(s)`);

    // Import and execute each plugin's Register.js
    for (const modulePath of modules) {
      try {
        const module = context(modulePath);
        const registerFn = module.default || module;

        if (typeof registerFn === 'function') {
          registerFn();
        } else {
          console.warn(`[Plugin System] ${modulePath} does not export a default function`);
        }
      } catch (error) {
        console.error(`[Plugin System] Failed to load ${modulePath}:`, error);
      }
    }

    console.log(`[Plugin System] Initialization complete. Active plugins:`, Object.keys(plugins));
  } catch (error) {
    console.error('[Plugin System] Failed to initialize plugins:', error);
  }
};
