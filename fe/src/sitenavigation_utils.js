import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import axiosInstance from './axios';
import { app_cfg } from './app.cfg';
import { getPlugin, getAllPluginNames, getPluginClassnameToIcon } from './plugins';
import axios from "./axios";

// Format object ID: if 16 chars, format as xxxx-xxxxxxxx-xxxx
export function formatObjectId(objId) {
    if (!objId) return objId;
    if (objId.length === 16) {
        return `${objId.slice(0, 4)}-${objId.slice(4, 12)}-${objId.slice(12, 16)}`;
    }
    return objId;
}
export function classname2bootstrapIcon(classname) {
    const mapping = {
        'DBCompany': 'building',
        'DBEvent': 'calendar-event',
        'DBFile': 'file-earmark-fill',
        'DBFolder': 'folder-fill',
        // 'DBImage': 'image-fill',
        'DBLink': 'link-45deg',
        'DBNews': 'newspaper-fill',
        'DBNote': 'file-text-fill',
        'DBObject': 'box-fill',
        'DBPage': 'file-richtext-fill',
        'DBPerson': 'person-fill',

        'DBUser': 'person-fill',
        'DBGroup': 'people-fill',
    };
    // Merge plugin classname to icon mappings (these can override defaults if classname matches)
    const pluginMapping = getPluginClassnameToIcon();
    Object.assign(mapping, pluginMapping);
    if (mapping[classname]) {
        return mapping[classname];
    }
    return 'question-circle-fill';
}
/**
 * 
 * @param {string} classname 
 * @returns IF there's a translation for this classname in any plugin, return "plugin-PLUGINNAME.CLASSNAME" for translation lookup, otherwise return null
 */
export function classname2label(classname) {
    const pluginNames = getAllPluginNames();
    for (const pluginName of pluginNames) {
        const plugin = getPlugin(pluginName);
        if (!plugin.translations || typeof plugin.translations !== 'object' || !plugin.translations.en) continue;
        if (plugin.translations.en[classname]) {
            return `plugin-${pluginName}.${classname}`;
        }
    }
    return null;
}
export function languageCode2FlagEmoji(languageCode) {
    const flags = {
        it: "🇮🇹",
        en: "🇬🇧",
        fr: "🇫🇷",
        de: "🇩🇪",
    };
    if (!languageCode) return '🏳️';
    const code = languageCode.substring(0, 2);
    // code has values like "EN", "FR", "DE", etc. We can convert these to regional indicator symbols to display flags  
    if (flags[code]) {
        return flags[code];
    }
    return '🏳️';
}
export function formatDescription(description) {
    if (!description) return '';
    // replace \n with <br/>

    // escape HTML special characters
    const escapeHtml = (text) => {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;");
    };

    return escapeHtml(description).replace(/\n/g, '<br/>');
}
export function formateDateTimeString(dateTimeString) {
    if (!dateTimeString) return '';

    var _datetimeString = dateTimeString;
    _datetimeString = _datetimeString.replace('1970-01-01 ', '');

    const date = new Date(_datetimeString);
    var ret = date.toLocaleString();
    if (ret === 'Invalid Date') {
        // If the date is invalid, return the original string (after stripping zero date/time)
        ret = _datetimeString;
        ret = ret.replace('0000-00-00 ', '');
        ret = ret.replace(' 00:00:00', '');
        ret = ret.replace('00:00:00', '');
    }
    // ret = ret.replace(' 00:00:00', '');
    ret = ret.replace(', 12:00:00 AM', '');
    return ret;
}


export function isTokenValid() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const expiresAt = localStorage.getItem("expires_at");
    if (!expiresAt) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    // console.log(`Token expiry check: now=${nowInSeconds}, expires_at=${expiresAt}`);
    if (nowInSeconds >= Number(expiresAt)) return false;

    // Optionally, you can implement further validation, e.g., check expiration
    return true;
}

export function isUserLoggedIn() {
    const userId = localStorage.getItem("user_id");
    return !!userId;
}

/**
 * The caller is responsible to handle post-logout actions
 */
export async function logoutUser() {
    try {
      const response = await axios.post("/logout");
      console.log("Logout response:", response.data);
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("username");
      localStorage.removeItem("user_id");
      localStorage.removeItem("groups");
      console.log("User logged out, localStorage cleared");
    //   setUsername(null);
    //   setChildren([]);
    //   loadChildren();
    //   navigate("/", { replace: true });
    // } catch (error) {
    //   console.error("Error during logout:", error);
    }
}

export function isAdminUser() {
    const groups = localStorage.getItem("groups") ? JSON.parse(localStorage.getItem("groups")) : [];
    return groups.includes("-2");
}

export function isWebmasterUser() {
    const groups = localStorage.getItem("groups") ? JSON.parse(localStorage.getItem("groups")) : [];
    const webmasterGroupId = app_cfg.webmaster_group_id || "-3"; 
    //process.env.REACT_APP_WEBMASTER_GROUP_ID || "-3";
    return groups.includes(webmasterGroupId);
}

export function isGuestUser() {
    const token = localStorage.getItem("token");
    const groupIDs = localStorage.getItem("groups") ? JSON.parse(localStorage.getItem("groups")) : [];
    return !token || token === "" || (groupIDs.length <= 2 && groupIDs.includes("-4"));
}
export function hasGroupAccess(requiredGroupId) {
    if (requiredGroupId === null || requiredGroupId === undefined) {
        return true; // No group restriction
    }
    const groups = localStorage.getItem("groups") ? JSON.parse(localStorage.getItem("groups")) : [];
    return groups.includes(String(requiredGroupId));
}
