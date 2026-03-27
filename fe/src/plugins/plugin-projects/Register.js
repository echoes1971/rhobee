import { registerPlugin } from '../index';
import { isTokenValid, isAdminUser } from '../../sitenavigation_utils';
import { Navigate } from 'react-router-dom';

import { Projects, ProjectEdit, ProjectView } from './DBProject';
import { Timetracks, TimetrackEdit, TimetrackView } from './DBTimetrack';
import { Todos, TodoEdit, TodoView } from './DBTodo';
import { Todotypes, TodotypeEdit, TodotypeView } from './DBTodoType';

/**
 * Example Plugin Registration with Translations
 * This file is automatically discovered and executed by the plugin system
 */
export default function registerProjectsPlugin() {
  const userIsAdmin = isAdminUser();
  const tokenIsValid = isTokenValid();

  // the plugin requires authentication
  if (!tokenIsValid) {
    console.warn("Projects plugin: user is not authenticated, skipping plugin registration");
    return;
  }

  
  var pluginConfig = {
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
      "DBTodoType": "check-square-fill",
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
        "DBTodoType": 'Todo Type',
        'priority': 'Priority',
        'reported_date': 'Reported Date',
        'fk_reported_by': 'Reported By',
        'fk_customer': 'Customer',
        'fk_project': 'Project',
        'fk_type': 'Type',
        'status': 'Status',
        'todo_description': 'Description',
        'intervention': 'Intervention',
        'closed_date': 'Closed Date',
        'order_position': 'Position',
        'intervention_hours': 'Intervention Hours',
        'travel_hours': 'Travel Hours',
        'travel_distance': 'Travel Distance',
        'intervention_location': 'Intervention Location',
        'hourly_rate': 'Hourly Rate',
        'currency': 'Currency',
      },
      fr: {
        "plugin_name": 'Projets',
        "DBProject": 'Projet',
        "DBTimeTrack": 'Suivi du temps',
        "DBTodo": 'Tâche',
        "DBTodoType": 'Type de tâche',
        'priority': 'Priorité',
        'reported_date': 'Date de signalement',
        'fk_reported_by': 'Signalé par',
        'fk_customer': 'Client',
        'fk_project': 'Projet',
        'fk_type': 'Type',
        'status': 'Statut',
        'todo_description': 'Description',
        'intervention': 'Intervention',
        'closed_date': 'Date de clôture',
        'order_position': 'Position',
        'intervention_hours': 'Heures d’intervention',
        'travel_hours': 'Heures de déplacement',
        'travel_distance': 'Distance de déplacement',
        'intervention_location': 'Lieu de l’intervention',
        'hourly_rate': 'Tarif horaire',
        'currency': 'Devise',

      },
      it: {
        "plugin_name": 'Progetti',
        "DBProject": 'Progetto',
        "DBTimeTrack": 'Tracciamento del tempo',
        "DBTodo": 'Da fare',
        "DBTodoType": 'Tipo di da fare',
        'priority': 'Priorità',
        'reported_date': 'Data di segnalazione',
        'fk_reported_by': 'Segnalato da',
        'fk_customer': 'Cliente',
        'fk_project': 'Progetto',
        'fk_type': 'Tipo',
        'status': 'Stato',
        'todo_description': 'Descrizione',
        'intervention': 'Intervento',
        'closed_date': 'Data di chiusura',
        'order_position': 'Posizione',
        'intervention_hours': 'Ore di intervento',
        'travel_hours': 'Ore di viaggio',
        'travel_distance': 'Distanza di viaggio',
        'intervention_location': 'Luogo di intervento',
        'hourly_rate': 'Tariffa oraria',
        'currency': 'Valuta',
      },
      de: {
        "plugin_name": 'Projekte',
        "DBProject": 'Projekt',
        "DBTimeTrack": 'Zeiterfassung',
        "DBTodo": 'Aufgabe',
        "DBTodoType": 'Aufgabentyp',
        'priority': 'Priorität',
        'reported_date': 'Meldedatum',
        'fk_reported_by': 'Gemeldet von',
        'fk_customer': 'Kunde',
        'fk_project': 'Projekt',
        'fk_type': 'Typ',
        'status': 'Status',
        'todo_description': 'Beschreibung',
        'intervention': 'Intervention',
        'closed_date': 'Abschlussdatum',
        'order_position': 'Position',
        'intervention_hours': 'Interventionsstunden',
        'travel_hours': 'Reisezeit',
        'travel_distance': 'Reisedistanz',
        'intervention_location': 'Interventionsort',
        'hourly_rate': 'Stundensatz',
        'currency': 'Währung',
      },
    },
    
    // Plugin hooks for lifecycle events
    hooks: {
      onRegister: () => {
        console.log('Projects plugin registered');
      },
      onAppLoad: () => {
        console.log('Projects plugin app loaded');
      }
    }
  }
  if (userIsAdmin) {
    pluginConfig.routes.push({ path: '/todo-types', element: <Todotypes /> });
    pluginConfig.view_components["DBTodoType"] = TodotypeView;
    pluginConfig.edit_components["DBTodoType"] = TodotypeEdit;
    pluginConfig.menuItems.push({});
    pluginConfig.menuItems.push({ label: 'Todo Types', path: '/todo-types', icon: 'bi-check-square-fill' });
  }
  registerPlugin('projects', pluginConfig);
}
