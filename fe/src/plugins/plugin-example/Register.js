import { registerPlugin } from '../index';

/**
 * Example Plugin Registration with Translations
 * This file is automatically discovered and executed by the plugin system
 */
export default function registerExamplePlugin() {
  registerPlugin('example', {
    name: 'Example Plugin',
    version: '1.0.0',
    description: 'A sample plugin to demonstrate the plugin system',
    
    // Routes added to your app
    routes: [
      // { path: '/example', element: <ExampleComponent /> }
    ],
    
    // Menu items to add to navigation
    menuItems: [
      // { label: 'Example', path: '/example', icon: 'star' }
    ],

    // Translations - namespace will be 'plugin-example'
    translations: {
      en: {
        title: 'Example Plugin',
        description: 'This is an example plugin',
        button: 'Click me',
      },
      fr: {
        title: 'Plugin Exemple',
        description: 'Ceci est un plugin exemple',
        button: 'Cliquez-moi',
      },
      it: {
        title: 'Plugin di Esempio',
        description: 'Questo è un plugin di esempio',
        button: 'Clicca su di me',
      },
      de: {
        title: 'Beispiel-Plugin',
        description: 'Dies ist ein Beispiel-Plugin',
        button: 'Klick mich',
      },
    },
    
    // Plugin hooks for lifecycle events
    hooks: {
      onRegister: () => {
        console.log('Example plugin registered');
      },
      onAppLoad: () => {
        console.log('Example plugin app loaded');
      }
    }
  });
}
