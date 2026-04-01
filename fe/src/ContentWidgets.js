import React, { useState, useEffect, useRef } from 'react';
import { Accordion, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axiosInstance from './axios';
import { classname2bootstrapIcon } from './sitenavigation_utils';
import ObjectList from "./ObjectList";


// Convert ISO 3166-1 alpha-2 code to flag emoji
export function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Component: Display country with flag emoji
export function CountryView({ country_id, dark }) {
    const [country, setCountry] = useState(null);

    useEffect(() => {
        const fetchCountry = async () => {
            // Read from localStorage every time (avoid stale state)
            const stored = localStorage.getItem('countries_cache');
            const cacheData = stored ? JSON.parse(stored) : null;

            // Check if cache exists and is not expired (24 hours)
            const now = Date.now();
            const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            let countries = {};
            if (cacheData && cacheData.expires_at && cacheData.expires_at > now) {
                // Cache is valid
                countries = cacheData.countries || {};
                const remainingSeconds = Math.floor((cacheData.expires_at - now) / 1000);
                console.log(`Countries cache VALID - expires in ${remainingSeconds}s at:`, new Date(cacheData.expires_at).toLocaleTimeString());
            } else {
                // Cache expired or doesn't exist - will be recreated
                if (cacheData?.expires_at) {
                    console.log('Countries cache EXPIRED at:', new Date(cacheData.expires_at).toLocaleTimeString(), 'now:', new Date(now).toLocaleTimeString());
                } else {
                    console.log('Countries cache MISSING, will rebuild');
                }
            }
            
            if (countries[country_id]) {
                setCountry(countries[country_id]);
                console.log('Loaded country from cache: ', country_id, "=", countries[country_id].Common_Name);
                return;
            }
            
            // Country not in cache, fetch from backend
            try {
                const response = await axiosInstance.get(`/content/country/${country_id}`);
                setCountry(response.data);
                
                // Update cache - re-read to avoid race conditions
                const currentStored = localStorage.getItem('countries_cache');
                const currentCache = currentStored ? JSON.parse(currentStored) : null;
                
                // Preserve expiry if cache is still valid, otherwise create new expiry
                let expiresAt = now + CACHE_DURATION;
                // TESTING: Force new expiry every time (comment out to preserve existing expiry)
                /*
                if (currentCache && currentCache.expires_at && currentCache.expires_at > now) {
                    expiresAt = currentCache.expires_at; // Keep existing expiry
                }
                */
                
                const updatedCache = {
                    expires_at: expiresAt,
                    countries: {
                        ...(currentCache?.countries || {}),
                        [country_id]: response.data
                    }
                };
                
                localStorage.setItem('countries_cache', JSON.stringify(updatedCache));
                console.log('Fetched and cached country: ', country_id, "=", response.data);
            } catch (error) {
                console.error('Error fetching country:', error);
            }
        }

        if (country_id && country_id !== "0") {
            fetchCountry();
        }
    }, [country_id]);

    if (!country_id || country_id === "0") {
        return null;
    }

    if (!country) {
        return <>Loading...</>;
    }

    const flag = getFlagEmoji(country.ISO_3166_1_2_Letter_Code);
    
    return (
        <>
            {flag && <span style={{ fontSize: '1.2em', marginRight: '0.3em' }}>{flag}</span>}
            {country.Common_Name}
        </>
    );
}
export function CountrySelector({ value, onChange, name, required }) {
    const { t } = useTranslation();
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/countries');
            setCountries(response.data.countries || []);
        } catch (err) {
            console.error('Error loading countries:', err);
            setCountries([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Form.Group className="mb-3">
                <Form.Label>{t('common.country')}</Form.Label>
                <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>{t('common.loading')}</span>
                </div>
            </Form.Group>
        );
    }

    return (
        <Form.Group className="mb-3">
            <Form.Label>{t('common.country')}</Form.Label>
            <Form.Select
                name={name || 'fk_countrylist_id'}
                value={value || '0'}
                onChange={onChange}
                required={required}
            >
                <option value="0">-- {t('common.select')} --</option>
                {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                        {getFlagEmoji(country.ISO_3166_1_2_Letter_Code)} {country.Common_Name}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
}

// Component: Link to user profile
export function UserLinkView({ user_id, dark }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            // Read from localStorage every time (avoid stale state)
            const stored = localStorage.getItem('users_cache');
            const cacheData = stored ? JSON.parse(stored) : null;

            // Check if cache exists and is not expired (1 hour)
            // Do localStorage.removeItem('users_cache'); // TESTING: clear cache
            const now = Date.now();
            const CACHE_DURATION = 1 * 60 * 60 * 1000 //24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            let users = {};
            if (cacheData && cacheData.expires_at && cacheData.expires_at > now) {
                // Cache is valid
                users = cacheData.users || {};
                const remainingSeconds = Math.floor((cacheData.expires_at - now) / 1000);
                console.log(`Users cache VALID - expires in ${remainingSeconds}s at:`, new Date(cacheData.expires_at).toLocaleTimeString());
            } else {
                // Cache expired or doesn't exist - will be recreated
                if (cacheData?.expires_at) {
                    console.log('Users cache EXPIRED at:', new Date(cacheData.expires_at).toLocaleTimeString(), 'now:', new Date(now).toLocaleTimeString());
                } else {
                    console.log('Users cache MISSING, will rebuild');
                }
            }
            
            if (users[user_id]) {
                setUser(users[user_id]);
                console.log('Loaded user from cache: ', user_id, "=", users[user_id].fullname);
                return;
            }
            
            // User not in cache, fetch from backend
            try {
                const response = await axiosInstance.get(`/users/${user_id}`);
                setUser(response.data);

                // Update cache - re-read to avoid race conditions
                const currentStored = localStorage.getItem('users_cache');
                const currentCache = currentStored ? JSON.parse(currentStored) : null;
                
                // Preserve expiry if cache is still valid, otherwise create new expiry
                let expiresAt = now + CACHE_DURATION;
                // TESTING: Force new expiry every time (comment out to preserve existing expiry)
                /*
                if (currentCache && currentCache.expires_at && currentCache.expires_at > now) {
                    expiresAt = currentCache.expires_at; // Keep existing expiry
                }
                */
                
                const updatedCache = {
                    expires_at: expiresAt,
                    users: {
                        ...(currentCache?.users || {}),
                        [user_id]: response.data
                    }
                };
                
                localStorage.setItem('users_cache', JSON.stringify(updatedCache));
                console.log('Fetched and cached user: ', user_id, "=", response.data.fullname);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }

        if (user_id && user_id !== "0") {
            fetchUser();
        }
    }, [user_id]);

    if (!user_id || user_id === "0") {
        return null;
    }

    return (
        <a href={'/users/'+user_id} rel="noopener noreferrer">
            {/* <i className="bi bi-person-circle" title={user ? user.fullname : ''}></i> */}
            {user ? user.fullname : user_id}
        </a>
    );
}

export function GroupLinkView({ group_id, dark }) {
    const [group, setGroup] = useState(null);

    useEffect(() => {
        const fetchGroup = async () => {
            // Read from localStorage every time (avoid stale state)
            const stored = localStorage.getItem('groups_cache');
            const cacheData = stored ? JSON.parse(stored) : null;

            // Check if cache exists and is not expired (1 hour)
            // Do localStorage.removeItem('users_cache'); // TESTING: clear cache
            const now = Date.now();
            const CACHE_DURATION = 1 * 60 * 60 * 1000 //24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            let groups = {};
            if (cacheData && cacheData.expires_at && cacheData.expires_at > now) {
                // Cache is valid
                groups = cacheData.groups || {};
                const remainingSeconds = Math.floor((cacheData.expires_at - now) / 1000);
                console.log(`Groups cache VALID - expires in ${remainingSeconds}s at:`, new Date(cacheData.expires_at).toLocaleTimeString());
            } else {
                // Cache expired or doesn't exist - will be recreated
                if (cacheData?.expires_at) {
                    console.log('Groups cache EXPIRED at:', new Date(cacheData.expires_at).toLocaleTimeString(), 'now:', new Date(now).toLocaleTimeString());
                } else {
                    console.log('Groups cache MISSING, will rebuild');
                }
            }
            
            if (groups[group_id]) {
                setGroup(groups[group_id]);
                console.log('Loaded group from cache: ', group_id, "=", groups[group_id].name);
                return;
            }
            
            // Group not in cache, fetch from backend
            try {
                const response = await axiosInstance.get(`/groups/${group_id}`);
                setGroup(response.data);

                // Update cache - re-read to avoid race conditions
                const currentStored = localStorage.getItem('groups_cache');
                const currentCache = currentStored ? JSON.parse(currentStored) : null;
                
                // Preserve expiry if cache is still valid, otherwise create new expiry
                let expiresAt = now + CACHE_DURATION;
                // TESTING: Force new expiry every time (comment out to preserve existing expiry)
                /*
                if (currentCache && currentCache.expires_at && currentCache.expires_at > now) {
                    expiresAt = currentCache.expires_at; // Keep existing expiry
                }
                */
                
                const updatedCache = {
                    expires_at: expiresAt,
                    groups: {
                        ...(currentCache?.groups || {}),
                        [group_id]: response.data
                    }
                };
                
                localStorage.setItem('groups_cache', JSON.stringify(updatedCache));
                console.log('Fetched and cached group: ', group_id, "=", response.data.name);
            } catch (error) {
                console.error('Error fetching group:', error);
            }
        }

        if (group_id && group_id !== "0") {
            fetchGroup();
        }
    }, [group_id]);

    if (!group_id || group_id === "0") {
        return null;
    }

    return (
        <a href={'/groups/'+group_id} rel="noopener noreferrer">
            <i className="bi bi-person-circle" title={group ? group.name : ''}></i> {group ? group.name : group_id}
        </a>
    );
}

/* Image Viewer Component

Params:
- id: file ID
- title: alt/title text
- thumbnail: boolean, whether to load thumbnail version
- style: CSS styles for the image
*/
export function ImageView({id, title, thumbnail, style}) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // console.log('ImageView useEffect:', { id });
        const loadPreview = async () => {
            try {
                // console.log('Loading image preview for:', id);
                const url = thumbnail ? `/files/${id}/download?preview=yes` : `/files/${id}/download`;
                const response = await axiosInstance.get(url, {
                    responseType: 'blob'
                });
                // console.log('Image loaded, blob size:', response.data.size, 'type:', response.data.type);
                // IF an image, create blob URL
                if (response.data.type.startsWith('image/')) {
                    const blobUrl = URL.createObjectURL(response.data);
                    // console.log('Blob URL created:', blobUrl);
                    setPreview(blobUrl);
                } else {
                    setPreview(null);
                }
            } catch (error) {
                console.error('Failed to load image preview:', error);
                setPreview(null);
            }
            finally {
                setLoading(false);
            }
        };
        loadPreview();

        // Cleanup blob URL on unmount
        return () => {
            if (preview && preview.startsWith('blob:')) {
                console.log('Revoking blob URL:', preview);
                URL.revokeObjectURL(preview);
            }
        };
    }, [id]);

    return (
        <>
        {preview && (
            <img 
                src={preview}
                alt={title || 'Preview'}
                title={title || 'Preview'}
                style={style || { maxWidth: '100%', maxHeight: '300px' }}
            />
        )}
        { !preview && loading && (
            // Show a spinner or placeholder while loading
            <div style={{style }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        )}
        { !preview && !loading && (
            // Show a placeholder if no preview is available
            <i 
                className={`bi bi-${classname2bootstrapIcon('DBFile')}`}
                style={{ ...style }}
            ></i>
            // <div style={{...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#888' }}>
            //     No Preview Available
            // </div>
        )}
        </>
    );
}

// Component: Link to object
export function ObjectLinkView({ obj_id, dark }) {
    const [myObject, setMyObject] = useState(null);

    useEffect(() => {
        const fetchObject = async () => {
            // Read from localStorage every time (avoid stale state)
            const stored = localStorage.getItem('objects_cache');
            const cacheData = stored ? JSON.parse(stored) : null;

            // Check if cache exists and is not expired (1 minute)
            // Do localStorage.removeItem('objects_cache'); // TESTING: clear cache
            const now = Date.now();
            const CACHE_DURATION = 1 * 60 * 1000 //24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            let objects = {};
            if (cacheData && cacheData.expires_at && cacheData.expires_at > now) {
                // Cache is valid
                objects = cacheData.objects || {};
                const remainingSeconds = Math.floor((cacheData.expires_at - now) / 1000);
                // console.log(`Objects cache VALID - expires in ${remainingSeconds}s at:`, new Date(cacheData.expires_at).toLocaleTimeString());
            } else {
                // Cache expired or doesn't exist - will be recreated
                if (cacheData?.expires_at) {
                    console.log('Objects cache EXPIRED at:', new Date(cacheData.expires_at).toLocaleTimeString(), 'now:', new Date(now).toLocaleTimeString());
                } else {
                    console.log('Objects cache MISSING, will rebuild');
                }
            }
            
            if (objects[obj_id]) {
                setMyObject(objects[obj_id]);
                // console.log('Loaded object from cache: ', obj_id, "=", objects[obj_id].data.name);
                return;
            }
            
            // Object not in cache, fetch from backend
            try {
                const response = await axiosInstance.get(`/content/${obj_id}`);
                setMyObject(response.data);
                // Update cache - re-read to avoid race conditions
                const currentStored = localStorage.getItem('objects_cache');
                const currentCache = currentStored ? JSON.parse(currentStored) : null;
                
                // Preserve expiry if cache is still valid, otherwise create new expiry
                let expiresAt = now + CACHE_DURATION;
                // TESTING: Force new expiry every time (comment out to preserve existing expiry)
                /*
                if (currentCache && currentCache.expires_at && currentCache.expires_at > now) {
                    expiresAt = currentCache.expires_at; // Keep existing expiry
                }
                */
                
                const updatedCache = {
                    expires_at: expiresAt,
                    objects: {
                        ...(currentCache?.objects || {}),
                        [obj_id]: response.data
                    }
                };
                
                localStorage.setItem('objects_cache', JSON.stringify(updatedCache));
                // console.log('Fetched and cached object: ', obj_id, "=", response.data.data.name);
            } catch (error) {
                console.error('Error fetching object:', error);
            }
        }

        if (obj_id && obj_id !== "0") {
            fetchObject();
        }
    }, [obj_id]);

    if (!obj_id || obj_id === "0") {
        return null;
    }

    return (
        <a href={'/c/'+obj_id} rel="noopener noreferrer">
            <i className={`bi bi-${classname2bootstrapIcon(myObject ? myObject.metadata.classname : '')}`} title={myObject ? myObject.metadata.classname : ''}></i> {myObject ? myObject.data.name : obj_id}
        </a>
    );
}

// Component: show object without the link
export function ObjectView({ obj_id, dark }) {
    const [myObject, setMyObject] = useState(null);

    useEffect(() => {
        const fetchObject = async () => {
            // Read from localStorage every time (avoid stale state)
            const stored = localStorage.getItem('objects_cache');
            const cacheData = stored ? JSON.parse(stored) : null;

            // Check if cache exists and is not expired (1 minute)
            // Do localStorage.removeItem('objects_cache'); // TESTING: clear cache
            const now = Date.now();
            const CACHE_DURATION = 1 * 60 * 1000 //24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            let objects = {};
            if (cacheData && cacheData.expires_at && cacheData.expires_at > now) {
                // Cache is valid
                objects = cacheData.objects || {};
                const remainingSeconds = Math.floor((cacheData.expires_at - now) / 1000);
                // console.log(`Objects cache VALID - expires in ${remainingSeconds}s at:`, new Date(cacheData.expires_at).toLocaleTimeString());
            } else {
                // Cache expired or doesn't exist - will be recreated
                if (cacheData?.expires_at) {
                    console.log('Objects cache EXPIRED at:', new Date(cacheData.expires_at).toLocaleTimeString(), 'now:', new Date(now).toLocaleTimeString());
                } else {
                    console.log('Objects cache MISSING, will rebuild');
                }
            }
            
            if (objects[obj_id]) {
                setMyObject(objects[obj_id]);
                // console.log('Loaded object from cache: ', obj_id, "=", objects[obj_id].data.name);
                return;
            }
            
            // Object not in cache, fetch from backend
            try {
                const response = await axiosInstance.get(`/content/${obj_id}`);
                setMyObject(response.data);
                // Update cache - re-read to avoid race conditions
                const currentStored = localStorage.getItem('objects_cache');
                const currentCache = currentStored ? JSON.parse(currentStored) : null;
                
                // Preserve expiry if cache is still valid, otherwise create new expiry
                let expiresAt = now + CACHE_DURATION;
                // TESTING: Force new expiry every time (comment out to preserve existing expiry)
                /*
                if (currentCache && currentCache.expires_at && currentCache.expires_at > now) {
                    expiresAt = currentCache.expires_at; // Keep existing expiry
                }
                */
                
                const updatedCache = {
                    expires_at: expiresAt,
                    objects: {
                        ...(currentCache?.objects || {}),
                        [obj_id]: response.data
                    }
                };
                
                localStorage.setItem('objects_cache', JSON.stringify(updatedCache));
                // console.log('Fetched and cached object: ', obj_id, "=", response.data.data.name);
            } catch (error) {
                console.error('Error fetching object:', error);
            }
        }

        if (obj_id && obj_id !== "0") {
            fetchObject();
        }
    }, [obj_id]);

    if (!obj_id || obj_id === "0") {
        return null;
    }

    return (
        <span>
            {myObject ? myObject.data.name : obj_id}
        </span>
    );
}


export function LanguageSelector({ fieldName, value, onChange, dark }) {
    const { t } = useTranslation();

    return (
        <Form.Group className="mb-3">
            <Form.Label>{t('common.language')}</Form.Label>
            <Form.Select
                name={fieldName}
                value={value}
                onChange={onChange}
            >
                <option value="">{t('common.select')}</option>
                <option value="en">🇬🇧 English</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="fr">🇫🇷 Français</option>
            </Form.Select>
        </Form.Group>

    );
}

export function LanguageView({ language, short }) {
    const languagePrefix = language ? language.split('_')[0] : language;
    const languageMap = {
        'en': '🇬🇧 English',
        'it': '🇮🇹 Italiano',
        'de': '🇩🇪 Deutsch',
        'fr': '🇫🇷 Français',
    };
    const languageShortMap = {
        'en': '🇬🇧',
        'it': '🇮🇹',
        'de': '🇩🇪',
        'fr': '🇫🇷',
    };

    return (
        <span>{short ? languageShortMap[languagePrefix] || languagePrefix : languageMap[languagePrefix] || languagePrefix}</span>
    );
}

export function TimeEdit({ value, onChange, name }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        // value is in format "HH:MM", convert to "1970-01-01THH:MM:00"
        const timeValue = value ? `1970-01-01 ${value}` : null;
        // Pass it as event-like object to onChange2
        onChange({ target: { name, value: timeValue } });
    }

    // console.log('TimeEdit render, value:', value);

    return (
        <input
            className="form-control"
            type="time-local"
            name={name}
            value={value && value.length > 8 ? value.substring(11,19) : (value.length === 8 ? value : '')}
            // on click down, select the nearest char to the click position to make it easier to edit hours vs minutes vs seconds
            onClick={(e) => {
                const input = e.target;
                const clickPosition = input.selectionStart;
                if (clickPosition < 8) {
                    // Clicked on hours
                    input.setSelectionRange(clickPosition, clickPosition + 1);
                } else {
                    // Clicked on seconds
                    input.setSelectionRange(7, 8);
                }
            }}
            // when goind left and right with arrow keys, keep the selection on the nearest char to make it easier to edit hours vs minutes vs seconds
            onKeyDown={(e) => {
                const input = e.target;
                var selectionStart = input.selectionStart;
                if (e.key === 'ArrowLeft') {
                    if (e.target.value[selectionStart-1] === ':') {
                        selectionStart -= 1;
                    }
                    if (selectionStart >= 0) {
                        e.preventDefault();
                        if (selectionStart > 0) {
                            input.setSelectionRange(selectionStart - 1, selectionStart);
                        } else {
                            input.setSelectionRange(0, 1);
                        }
                    }
                } else if (e.key === 'ArrowRight') {
                    if (selectionStart < input.value.length) {
                        e.preventDefault();
                        if (e.target.value[selectionStart+1] === ':') {
                            selectionStart += 1;
                        }
                        if (selectionStart < 7) {
                            input.setSelectionRange(selectionStart+1, selectionStart+2);
                        } else {
                            input.setSelectionRange(7, 8);
                        }
                    }
                }
            }}
            onChange={(e) => {
                var clickPosition = e.target.selectionStart;
                handleChange(e);
                setTimeout(() => {
                    if (e.target.value[clickPosition] === ':') {
                        clickPosition += 1;
                    }
                    if (clickPosition < 8) {
                        e.target.setSelectionRange(clickPosition, clickPosition+1);
                    } else {
                        e.target.setSelectionRange(7, 8);
                    }
                }, 0);
            }
            }
            // onChange={handleChangeHours}
        />
    );
}

/**
 * 
 * @param {*} param0 
 * @description multiple options for ordering: "last_modify_date","creation_date","name","description","owner","group_id","creator","last_modify","deleted_by","deleted_date"
 * each one can be asc or desc. Options will be separated by comma, e.g. "last_modify_date desc, name asc"
 * @returns 
 */
export function OrderBySelector({ value, onChange, name }) {
    const { t } = useTranslation();
    const [selectedOptions, setSelectedOptions] = useState([]);
    const lastValueRef = useRef(null);

    const fields = [
        'last_modify_date',
        'creation_date',
        'name',
        'description',
        'owner',
        'group_id',
        'creator',
        'last_modify',
        'deleted_by',
        'deleted_date',
        'classname',
    ];

    const formatFieldLabel = (field) => {
        switch (field) {
            case 'last_modify_date':
                return t('dbobjects.modified');
            case 'creation_date':
                return t('dbobjects.created');
            case 'name':
                return t('dbobjects.name');
            case 'description':
                return t('dbobjects.description');
            case 'owner':
                return t('dbobjects.owner');
            case 'group_id':
                return t('dbobjects.group');
            case 'creator':
                return t('dbobjects.creator');
            case 'last_modify':
                return t('dbobjects.last_modify');
            case 'deleted_by':
                return t('dbobjects.deleted_by');
            case 'deleted_date':
                return t('dbobjects.deleted');
            case 'classname':
                return t('dbobjects.classname') || 'classname';
            default:
                return field;
        }
    };

    const parseValue = (valueString) => {
        if (!valueString || !valueString.toString().trim()) {
            return [];
        }
        const items = valueString
            .toString()
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        const result = [];
        for (const item of items) {
            const parts = item.split(/\s+/);
            if (parts.length === 0) continue;
            const field = parts[0].trim();
            if (!fields.includes(field)) continue;
            const directionToken = parts[1]?.trim()?.toLowerCase();
            const direction = directionToken === 'desc' ? 'desc' : 'asc';
            result.push({ field, direction });
        }
        return result;
    };

    const stringifyValue = (options) =>
        options
            .map((opt) => `${opt.field} ${opt.direction}`)
            .join(', ');

    // Solo sincronizzare dal parent se value è effettivamente cambiato
    useEffect(() => {
        if (lastValueRef.current !== value) {
            lastValueRef.current = value;
            const parsed = parseValue(value);
            setSelectedOptions(parsed);
        }
    }, [value, fields]);

    const emitChange = (newSelected) => {
        setSelectedOptions(newSelected);
        const flatValue = stringifyValue(newSelected);
        lastValueRef.current = flatValue; // Marca come "emesso da noi"
        if (onChange) {
            onChange({ target: { name, value: flatValue } });
        }
    };

    const handleItemClick = (field, event) => {
        const isCtrlClick = event && (event.ctrlKey || event.metaKey);
        const idx = selectedOptions.findIndex((opt) => opt.field === field);

        if (idx >= 0) {
            if (isCtrlClick) {
                // Ctrl/Cmd-click: deselect
                const newSelected = selectedOptions.filter((opt) => opt.field !== field);
                emitChange(newSelected);
            } else {
                // Normal click: toggle direction
                const newSelected = selectedOptions.map((opt) =>
                    opt.field === field
                        ? { ...opt, direction: opt.direction === 'asc' ? 'desc' : 'asc' }
                        : opt
                );
                emitChange(newSelected);
            }
        } else {
            // Non selezionato, aggiungi
            const newSelected = [...selectedOptions, { field, direction: 'asc' }];
            emitChange(newSelected);
        }
    };

    const dragStartField = (event, index) => {
        event.dataTransfer.setData('text/plain', index);
        event.dataTransfer.effectAllowed = 'move';
    };

    const dragOverItem = (event) => {
        event.preventDefault();
    };

    const dropItem = (event, targetIndex) => {
        event.preventDefault();
        const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
            return;
        }

        const allItems = [
            ...selectedOptions.map((opt) => ({ ...opt, selected: true })),
            ...fields
                .filter((f) => !selectedOptions.some((opt) => opt.field === f))
                .map((field) => ({ field, direction: 'asc', selected: false })),
        ];

        const movedItem = allItems.splice(sourceIndex, 1)[0];
        allItems.splice(targetIndex, 0, movedItem);

        const newSelected = allItems
            .filter((item) => item.selected)
            .map((item) => ({ field: item.field, direction: item.direction }));
        emitChange(newSelected);
    };

    const displayedItems = [
        ...selectedOptions.map((opt) => ({ ...opt, selected: true })),
        ...fields
            .filter((f) => !selectedOptions.some((opt) => opt.field === f))
            .map((field) => ({ field, direction: 'asc', selected: false })),
    ];

    return (
        <Form.Group className="mb-3">
            <Form.Label>{t('dbobjects.childs_sort_by')}</Form.Label>
            <ListGroup style={{ overflowY: 'auto' }}>
                {displayedItems.map((item, index) => {
                    const active = item.selected;
                    const arrow = item.selected ? (item.direction === 'desc' ? '▼' : '▲') : '';
                    return (
                        <ListGroup.Item
                            key={item.field}
                            draggable
                            active={active}
                            onMouseDown={(e) => {
                                // Assicuriamoci che l'evento sia catturato correttamente
                                if (e.button === 0) {
                                    // left click
                                    setTimeout(() => {
                                        handleItemClick(item.field, e);
                                    }, 0);
                                }
                            }}
                            onDragStart={(event) => dragStartField(event, index)}
                            onDragOver={dragOverItem}
                            onDrop={(event) => dropItem(event, index)}
                            style={{
                                cursor: active ? 'move' : 'pointer',
                                userSelect: 'none',
                                opacity: active ? 1 : 0.6,
                            }}
                        >
                            <span>{formatFieldLabel(item.field)}</span>
                            <span style={{ float: 'right', fontWeight: 'bold' }}>{arrow}</span>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
            <small className="text-muted d-block mb-2">{t('dbobjects.childs_sort_by_hint')}</small>
        </Form.Group>
    );
}

export function ChildrenSortOrder({ father_id, name, value, onChange, saving, dark}) {
    const { t } = useTranslation();
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [children, setChildren] = useState([]);
    const [sortedChildrenIds, setSortedChildrenIds] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const childs_sort_order = value || '';

    useEffect(() => {
        if (father_id) {
            loadChildren();
        }
    }, [father_id]);

    const loadChildren = async () => {
        setLoadingChildren(true);
        try {
            const response = await axiosInstance.get(`/nav/children/${father_id}`);
            const childrenData = response.data.children || [];
            setChildren(childrenData);
            
            // Initialize sorted order from childs_sort_order or use current order
            if (childs_sort_order) {
                const orderIds = childs_sort_order.split(',').filter(id => id);
                setSortedChildrenIds(orderIds);
            }
            if(sortedChildrenIds.length !== 0) {
                console.log('Initial sortedChildrenIds:', sortedChildrenIds);
            }
        } catch (error) {
            console.error('Failed to load children:', error);
        } finally {
            setLoadingChildren(false);
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...sortedChildrenIds];
        const draggedItem = newOrder[draggedIndex];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, draggedItem);

        setSortedChildrenIds(newOrder);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        // Update formData with new order
        onChange({
            target: {
                name: name,
                value: sortedChildrenIds.join(',')
            }
        });
        // setFormData(prev => ({
        //     ...prev,
        //     childs_sort_order: sortedChildrenIds.join(',')
        // }));
    };

    const toggleChildInOrder = (childId) => {
        const newOrder = sortedChildrenIds.includes(childId)
            ? sortedChildrenIds.filter(id => id !== childId)
            : [...sortedChildrenIds, childId];
        
        setSortedChildrenIds(newOrder);
        onChange({
            target: {
                name: name,
                value: newOrder.join(',')
            }
        });
        // setFormData(prev => ({
        //     ...prev,
        //     childs_sort_order: newOrder.join(',')
        // }));
    };

    // Get child name by ID
    const getChildName = (childId) => {
        const child = children.find(c => c.data.id === childId);
        return child ? child.data.name : childId;
    };

    return (
        <>
        {children.length > 0 && (
            <Form.Group className="mb-3">
                <Form.Label>
                    {t('folder.children_order')}
                    <small className="ms-2 text-secondary">
                        ({t('folder.drag_to_reorder')})
                    </small>
                </Form.Label>
                
                {loadingChildren ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" />
                    </div>
                ) : (
                    <>
                        {/* List of sorted children (draggable) */}
                        <div className={`border rounded p-2 mb-2 ${dark ? 'border-secondary' : ''}`}>
                            {sortedChildrenIds.length === 0 ? (
                                <div className="text-secondary text-center p-2">
                                    {t('folder.no_children_selected')}
                                </div>
                            ) : (
                                sortedChildrenIds.map((childId, index) => (
                                    <div
                                        key={childId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`d-flex align-items-center p-2 mb-1 rounded ${
                                            dark ? 'bg-dark' : 'bg-light'
                                        } ${draggedIndex === index ? 'opacity-50' : ''}`}
                                        style={{ cursor: 'move' }}
                                    >
                                        <i className="bi bi-grip-vertical me-2"></i>
                                        <span className="flex-grow-1">{getChildName(childId)}</span>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => toggleChildInOrder(childId)}
                                            disabled={saving}
                                        >
                                            <i className="bi bi-x"></i>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* List of available children (not in sort order) */}
                        {children.filter(child => !sortedChildrenIds.includes(child.data.id)).length > 0 && (
                            <Accordion className="mb-3 rhobee-theme">
                                <Accordion.Item eventKey="0" className='rhobee-theme'>
                                    <Accordion.Header className='rhobee-theme'>
                                        {t('folder.available_children')} ({children.filter(child => !sortedChildrenIds.includes(child.data.id)).length})
                                    </Accordion.Header>
                                    <Accordion.Body className='rhobee-theme'>
                                        <ObjectList
                                            items={children
                                                .filter(child => !sortedChildrenIds.includes(child.data.id))
                                                .map(child => ({
                                                    id: child.data.id,
                                                    name: child.data.name,
                                                    description: child.data.description,
                                                    classname: child.metadata?.classname
                                                }))
                                            }
                                            onItemClick={(item) => toggleChildInOrder(item.id)}
                                            showViewToggle={true}
                                            storageKey="folderChildrenViewMode"
                                            defaultView="list"
                                        />
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        )}
                    </>
                )}
            </Form.Group>
        )}
        </>
    );
}
