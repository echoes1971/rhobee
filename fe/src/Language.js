import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';



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
