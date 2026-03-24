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
      "DBProject": "gear", //"folder2-open",
      "DBTimeTrack": "clock-history",
      "DBTodo": "check-square",
    },
    
    // Menu items to add to navigation
    menuItems: [
      // Bootstrap Icons: https://icons.getbootstrap.com/
      { label: 'Projects', path: '/projects', icon: 'bi-gear' },
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
        'priority': 'Priority',
        'reported_date': 'Reported Date',
        'fk_reported_by': 'Reported By',
        'fk_customer': 'Customer',
        'fk_project': 'Project',
        'fk_type': 'Type',
        'status': 'Status',
        'todo_description': 'Description',
        'intervention': 'Intervention',
        'closed_date': 'Closed Date'
      },
      fr: {
        "plugin_name": 'Projets',
        "DBProject": 'Projet',
        "DBTimeTrack": 'Suivi du temps',
        "DBTodo": 'Tâche',
        'priority': 'Priorité',
        'reported_date': 'Date de signalement',
        'fk_reported_by': 'Signalé par',
        'fk_customer': 'Client',
        'fk_project': 'Projet',
        'fk_type': 'Type',
        'status': 'Statut',
        'todo_description': 'Description',
        'intervention': 'Intervention',
        'closed_date': 'Date de clôture'
      },
      it: {
        "plugin_name": 'Progetti',
        "DBProject": 'Progetto',
        "DBTimeTrack": 'Tracciamento del tempo',
        "DBTodo": 'Da fare',
        'priority': 'Priorità',
        'reported_date': 'Data di segnalazione',
        'fk_reported_by': 'Segnalato da',
        'fk_customer': 'Cliente',
        'fk_project': 'Progetto',
        'fk_type': 'Tipo',
        'status': 'Stato',
        'todo_description': 'Descrizione',
        'intervention': 'Intervento',
        'closed_date': 'Data di chiusura'
      },
      de: {
        "plugin_name": 'Projekte',
        "DBProject": 'Projekt',
        "DBTimeTrack": 'Zeiterfassung',
        "DBTodo": 'Aufgabe',
        'priority': 'Priorität',
        'reported_date': 'Meldedatum',
        'fk_reported_by': 'Gemeldet von',
        'fk_customer': 'Kunde',
        'fk_project': 'Projekt',
        'fk_type': 'Typ',
        'status': 'Status',
        'todo_description': 'Beschreibung',
        'intervention': 'Intervention',
        'closed_date': 'Abschlussdatum'
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
