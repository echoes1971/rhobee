import React, { useParams } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import AppNavbar from "./Navbar";
import './App.css';

import { app_cfg } from './app.cfg';

import DefaultPage from "./DefaultPage";
import { AdminDashboard } from './admin/Dashboard';
import Login from "./Login";
import Users from "./Users";
import UserProfile from "./UserProfile";
import Groups from './Groups';
import GroupProfile from './GroupProfile';
import { Companies } from './dbobjects/DBCompany';
import { Events } from './dbobjects/DBEvent';
import { FileDownload, Files } from "./dbobjects/DBFile";
import { Folders } from './dbobjects/DBFolders';
import { Links } from './dbobjects/DBLink';
import { News } from './dbobjects/DBNews';
import { Notes } from './dbobjects/DBNote';
import { Objects } from "./dbobjects/DBObject";
import { Pages } from "./dbobjects/DBPage";
import { People } from './dbobjects/DBPeople';
import SiteNavigation from './SiteNavigation';
import ContentEdit from './ContentEdit';
import Search from './Search';
import { AppFooter } from './Footer';
import { isAdminUser, isWebmasterUser, isGuestUser, isTokenValid } from './sitenavigation_utils';

function App() {
  // 
  const { t, i18n } = useTranslation();
  console.log("App: current language: " + i18n.language);
  // IF language IS NOT set in localStorage, get browser language and set it if supported by the app
  const storedLanguage = localStorage.getItem("lang");
  console.log("App: stored language: " + storedLanguage);
  if (!storedLanguage) {
    const browserLanguage = navigator.language || navigator.userLanguage;
    const browserLanguageCode = browserLanguage.substring(0, 2); // Get first 2 chars (e.g. "en", "it", etc.)
    console.log("App: browser language: " + browserLanguageCode);
    const supportedLanguages = Object.keys(app_cfg.supported_languages);
    if (supportedLanguages.includes(browserLanguageCode)) {
      i18n.changeLanguage(browserLanguageCode);
      localStorage.setItem("lang", browserLanguageCode);
    } else {
      // If browser language is not supported, set default language
      i18n.changeLanguage(app_cfg.default_language);
      localStorage.setItem("lang", app_cfg.default_language);
    }
  }

  // const token = localStorage.getItem("token");
  const isValidToken = isTokenValid();
  // console.log("App: token present: " + (token ? "yes" : "no") + ", valid: " + (validToken ? "yes" : "no"));
  const groups = localStorage.getItem("groups") ? JSON.parse(localStorage.getItem("groups")) : [];
  const isAdmin = isAdminUser();
  const isWebmaster = isWebmasterUser();
  
  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-fill">
        <Router>
          <AppNavbar />
          <Routes>
            <Route path="/" element={<SiteNavigation />} />
            <Route path="/default" element={<DefaultPage />} />
            <Route path="/login" element={<Login />} />

            {/* Site Navigation - content by object ID */}
            <Route path="/c/:objectId" element={<SiteNavigation />} />
            <Route path="/c" element={<SiteNavigation />} />

            {/* Global Search */}
            <Route path="/search" element={<Search />} />

            {/* File download by object ID */}
            <Route path="/f/:objectId/download" element={<FileDownload />} />

            {/* Content Edit - edit object by ID (requires authentication) */}
            <Route path="/e/:id" element={isValidToken ? <ContentEdit /> : <Navigate to={`/c/${window.location.pathname.split('/').pop()}`} replace />} />

            {/* User profile - accessible by the user themselves or admins */}
            <Route path="/users/:userId" element={isValidToken ? <UserProfile /> : <Navigate to="/login" />} />

            {/* Group profile - only for admins */}
            <Route path="/groups/:groupId" element={isValidToken ? <GroupProfile /> : <Navigate to="/" />} />

            {/* **** Webmaster **** */}
            <Route path="/folders" element={isValidToken && isWebmaster ? <Folders /> : <Navigate to="/" />} />
            <Route path="/pages"   element={isValidToken && isWebmaster ?   <Pages /> : <Navigate to="/" />} />
            <Route path="/news"    element={isValidToken && isWebmaster ?    <News /> : <Navigate to="/" />} />
            <Route path="/files"   element={isValidToken && isWebmaster ?   <Files /> : <Navigate to="/" />} />
            <Route path="/links"   element={isValidToken && isWebmaster ?   <Links /> : <Navigate to="/" />} />
            <Route path="/events"  element={isValidToken && isWebmaster ?  <Events /> : <Navigate to="/" />} />

            {/* **** Contacts **** */}
            <Route path="/companies" element={isValidToken ? <Companies /> : <Navigate to="/" />} />
            <Route path="/people"    element={isValidToken ?    <People /> : <Navigate to="/" />} />
            {/* **** User menu **** */}
            <Route path="/notes"    element={isValidToken ?    <Notes /> : <Navigate to="/" />} />

            {/* **** Admin **** */}

            {/* Protected routes - only for admins (group -2) */}
            <Route path="/admin/dashboard" element={isValidToken && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />

            <Route path="/users" element={isValidToken && isAdmin ? <Users /> : <Navigate to="/" />} />
            <Route path="/groups" element={isValidToken && isAdmin ? <Groups /> : <Navigate to="/" />} />

            <Route path="/objects"    element={isValidToken ?    <Objects /> : <Navigate to="/" />} />

            {/* Default -> redirect to / */}
            <Route path="*" element={<Navigate to="/default" />} />
          </Routes>
        </Router>
      </main>
      <AppFooter />
    </div>
  );
}

export default App;
