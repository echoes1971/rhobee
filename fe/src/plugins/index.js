/**
 * Plugin Registry System
 * Auto-discovers and registers plugins from subdirectories
 */

import i18n from 'i18next';

const plugins = {};
const pluginRoutes = [];
const pluginMenuItems = [];
const pluginViewComponents = {};
const pluginEditComponents = {};

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

  // Collect routes (annotate with plugin name/group to allow filtering later)
  if (plugin.routes && Array.isArray(plugin.routes)) {
    plugin.routes.forEach(r => {
      // keep original object but add metadata
      const annotated = { ...r };
      if (groupId !== null) annotated._groupId = groupId;
      annotated._pluginName = name;
      pluginRoutes.push(annotated);
    });
  }

  // Collect view/edit components
  if (plugin.view_components && typeof plugin.view_components === 'object') {
    Object.entries(plugin.view_components).forEach(([classname, Component]) => {
      pluginViewComponents[classname] = Component;
    });
  }
  if (plugin.edit_components && typeof plugin.edit_components === 'object') {
    Object.entries(plugin.edit_components).forEach(([classname, Component]) => {
      pluginEditComponents[classname] = Component;
    });
  }

  // Collect menu items
  if (plugin.menuItems && Array.isArray(plugin.menuItems)) {
    pluginMenuItems.push(...plugin.menuItems);
  }

  // Register translations.  We keep a dedicated namespace (plugin-<name>) and
  // also merge the same resources into the default namespace under a top-level
  // key so that existing code can continue using dot‑separated labels like
  // "plugin-projects.DBProject".
  if (plugin.translations && typeof plugin.translations === 'object') {
    Object.entries(plugin.translations).forEach(([lang, resources]) => {
      if (resources && typeof resources === 'object') {
        const ns = `plugin-${name}`;
        // dedicated namespace
        i18n.addResourceBundle(lang, ns, resources, true, true);
        // also add as a nested object in the default namespace for backward
        // compatibility with t('plugin-projects.DBProject') style keys
        const defaultBundle = i18n.getResourceBundle(lang, i18n.options.defaultNS) || {};
        if (!defaultBundle[ns]) {
          defaultBundle[ns] = {};
        }
        Object.assign(defaultBundle[ns], resources);
        i18n.addResourceBundle(lang, i18n.options.defaultNS, defaultBundle, true, true);

        console.log(`[Plugin System] Added translations for ${lang}: ${ns}`);
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
export const getAllPluginViewComponents = () => ({ ...pluginViewComponents });
export const getAllPluginEditComponents = () => ({ ...pluginEditComponents });
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
