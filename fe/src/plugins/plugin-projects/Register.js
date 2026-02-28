import { registerPlugin } from '../index';
import { Navigate } from 'react-router-dom';

import { Projects, ProjectEdit, ProjectView } from './DBProject';
import { Timetracks, TimetrackEdit, TimetrackView } from './DBTimetrack';
import { Todos, TodoEdit, TodoView } from './DBTodo';

/**
 * Example Plugin Registration with Translations
 * This file is automatically discovered and executed by the plugin system
 */
export default function registerProjectsPlugin() {
  registerPlugin('projects', {
    name: 'Projects',
    version: '1.0.0',
    description: 'Contains the logic for the old Project Management implementation in PHP',

    group_id: -5, // Group ID associated with this plugin: if the user belongs to this group, the plugin will be active. Set to null or omit for all users.

    // Routes added to your appPlugin
    routes: [
      { path: '/projects', element: <Projects /> },
      { path: '/timetracks', element: <Timetracks /> },
      { path: '/todos', element: <Todos /> },
    ],

    view_components: {
      "DBProject":ProjectView,
      "DBTimeTrack": TimetrackView,
      "DBTodo": TodoView,
    },
    edit_components: {
      "DBProject":ProjectEdit,
      "DBTimeTrack": TimetrackEdit,
      "DBTodo": TodoEdit,
    },

    classname2bootstrapIcon: {
      "DBProject": "folder2-open",
      "DBTimeTrack": "clock-history",
      "DBTodo": "check-square",
    },
    
    // Menu items to add to navigation
    menuItems: [
      // Bootstrap Icons: https://icons.getbootstrap.com/
      { label: 'Projects', path: '/projects', icon: 'bi-folder2-open' },
      { label: 'Timetracks', path: '/timetracks', icon: 'bi-clock-history' },
      { label: 'Todos', path: '/todos', icon: 'bi-check-square' },
      // {}, // Empty item for horizontal separator
      // { label: 'Item 2', path: '/item2', icon: 'bi-gear-fill' },
    ],

    // Translations - namespace will be 'plugin-projects', but resources are also
    // merged into the default namespace under the same key so you can use
    // "plugin-projects.DBProject" in t().
    translations: {
      en: {
        "plugin_name": 'Projects',
        "DBProject": 'Project',
        "DBTimeTrack": 'Timetrack',
        "DBTodo": 'Todo',
      },
      fr: {
        "plugin_name": 'Projets',
        "DBProject": 'Projet',
        "DBTimeTrack": 'Suivi du temps',
        "DBTodo": 'Tâche',
      },
      it: {
        "plugin_name": 'Progetti',
        "DBProject": 'Progetto',
        "DBTimeTrack": 'Tracciamento del tempo',
        "DBTodo": 'Da fare',
      },
      de: {
        "plugin_name": 'Projekte',
        "DBProject": 'Projekt',
        "DBTimeTrack": 'Zeiterfassung',
        "DBTodo": 'Aufgabe',
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
