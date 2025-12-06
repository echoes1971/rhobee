import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axiosInstance from './axios';

// Format object ID: if 16 chars, format as xxxx-xxxxxxxx-xxxx
export function formatObjectId(objId) {
    if (!objId) return objId;
    if (objId.length === 16) {
        return `${objId.slice(0, 4)}-${objId.slice(4, 12)}-${objId.slice(12, 16)}`;
    }
    return objId;
}
export function classname2bootstrapIcon(classname) {
    switch (classname) {
        case 'DBCompany':
            return 'building';
        case 'DBFile':
            return 'file-earmark-fill';
        case 'DBFolder':
            return 'folder-fill';
        // case 'DBImage':
        //     return 'image-fill';
        case 'DBLink':
            return 'link-45deg';
        case 'DBNews':
            return 'newspaper-fill';
        case 'DBNote':
            return 'file-text-fill';
        case 'DBObject':
            return 'box-fill';
        case 'DBPage':
            return 'file-richtext-fill';
        case 'DBPerson':
            return 'person-fill';
        default:
            return 'question-circle-fill';
    }
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
    const date = new Date(dateTimeString);
    return date.toLocaleString();
}

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
            try {
                const response = await axiosInstance.get(`/content/country/${country_id}`);
                setCountry(response.data);
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

// Component: Link to user profile
export function UserLinkView({ user_id, dark }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/users/${user_id}`);
                setUser(response.data);
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
            <i className="bi bi-person-circle" title={user ? user.fullname : ''}></i> {user ? user.fullname : user_id}
        </a>
    );
}

export function GroupLinkView({ group_id, dark }) {
    const [group, setGroup] = useState(null);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await axiosInstance.get(`/groups/${group_id}`);
                setGroup(response.data);
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
        console.log('ImageView useEffect:', { id });
        const loadPreview = async () => {
            try {
                console.log('Loading image preview for:', id);
                const url = thumbnail ? `/files/${id}/download?preview=yes` : `/files/${id}/download`;
                const response = await axiosInstance.get(url, {
                    responseType: 'blob'
                });
                console.log('Image loaded, blob size:', response.data.size, 'type:', response.data.type);
                // IF an image, create blob URL
                if (response.data.type.startsWith('image/')) {
                    const blobUrl = URL.createObjectURL(response.data);
                    console.log('Blob URL created:', blobUrl);
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
            try {
                const response = await axiosInstance.get(`/content/${obj_id}`);
                setMyObject(response.data);
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
