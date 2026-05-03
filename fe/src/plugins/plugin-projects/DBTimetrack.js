import React, { useContext, useState, useEffect } from 'react';
import { Accordion, Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    formateDateTimeString, 
    formatDescription, 
    classname2bootstrapIcon,
} from '../../sitenavigation_utils';
import {
  CountryView,
  CountrySelector,
  GroupLinkView,
  ImageView,
  LanguageSelector,
  LanguageView,
  ObjectLinkView,
  UserLinkView,
  TimeEdit,
  ObjectView,
} from '../../ContentWidgets';
import { ObjectSearch, ObjectHeaderView, ObjectFooterView } from "../../dbobjects/DBObject";
import ObjectLinkSelector from '../../ObjectLinkSelector'
import PermissionsEditor from '../../PermissionsEditor';
import { getErrorMessage } from "../../errorHandler";
import { HtmlView } from '../../ContentHtml';
import axiosInstance from '../../axios';
import { ThemeContext } from '../../ThemeContext';


const statusMap = {
    "": "--",
    "0": "to be invoiced",
    "1": "not to be invoiced",
    "2": "invoiced",
    "3": "assistance"
}
const interventionLocationMap = {
    "": "--",
    "0": "Office",
    "1": "Remote (via ssh/etc.)",
    "2": "On site"
}

/*
	function getViewColumnNames() { return array(
// 		'fk_progetto','father_id','fk_obj_id',
		'name','description',
		'fk_progetto','dalle_ore','alle_ore','ore_intervento','ore_viaggio','km_viaggio',
		'luogo_di_intervento','stato','costo_per_ora','costo_valuta',
		); }
*/
export function TimetrackView({ data, metadata, objectData, dark }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [objectDataState, setObjectDataState] = useState(objectData);

    useEffect(() => {
        // if (metadata.classname === 'DBFolder' || metadata.classname === 'DBPage' || metadata.classname === 'DBNews') {
        //     return;
        // }
        
        const loadUserData = async () => {
            // if (objectData!==null) {
            //     return;
            // }
            try {
                // Collect unique user IDs
                const uniqueUserIds = new Set();
                if (data.owner) uniqueUserIds.add(data.owner);
                if (data.creator) uniqueUserIds.add(data.creator);
                if (data.last_modify) uniqueUserIds.add(data.last_modify);
                if (data.deleted_by) uniqueUserIds.add(data.deleted_by);
                
                // Fetch all unique users in parallel
                const userPromises = Array.from(uniqueUserIds).map(userId =>
                    axiosInstance.get(`/users/${userId}`).then(res => ({ id: userId, data: res.data }))
                );
                
                const groupPromise = data.group_id && data.group_id!=="0" ? axiosInstance.get(`/groups/${data.group_id}`) : Promise.resolve({data: { name: '' }});
                
                const [users, groupRes] = await Promise.all([
                    Promise.all(userPromises),
                    groupPromise
                ]);
                
                // Create a map of userId -> user data
                const userMap = {};
                users.forEach(user => {
                    userMap[user.id] = user.data.fullname;
                });
                
                setObjectData({
                    owner_name: userMap[data.owner] || '',
                    group_name: groupRes.data.name,
                    creator_name: userMap[data.creator] || '',
                    last_modifier_name: userMap[data.last_modify] || '',
                    deleted_by_name: userMap[data.deleted_by] || ''
                });
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        
        loadUserData();
    }, [data.owner, data.group_id, data.creator, data.last_modify, data.deleted_by, metadata.classname]);

    return (
        <Card className="mb-3" bg={dark ? 'dark' : 'light'} text={dark ? 'light' : 'dark'}>
            <Card.Header className={dark ? 'bg-secondary bg-opacity-10' : ''} style={dark ? { borderBottom: '1px solid rgba(255,255,255,0.1)' } : {}}>
                <ObjectHeaderView data={data} metadata={metadata} objectData={objectData} dark={dark} />
            </Card.Header>
            <Card.Body className={dark ? 'bg-secondary bg-opacity-10' : ''}>
                <h2 className={dark ? 'text-light' : 'text-dark'}>{data.name}</h2>
                {data.description && (
                    <div className="row">
                        <div className='col-md-2 col-4 text-end'>{t('common.description')}: </div>
                        <div className='col-md-10 col-8' dangerouslySetInnerHTML={{ __html: formatDescription(data.description) }} />
                    </div>
                )}
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.fk_project')}:</div>
                    <div className='col-md-3 col-8'><ObjectLinkView obj_id={data.fk_project} dark={dark} /></div>
                </div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('common.from')}:</div>
                    <div className='col-md-3 col-8'> {formateDateTimeString(data.from_time)}</div>
                    <div className='col-md-2 col-4 text-end'>{t('common.to')}:</div>
                    <div className='col-md-3 col-8'> {formateDateTimeString(data.to_time)}</div>
                </div>

                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.intervention_hours')}:</div>
                    <div className='col-md-3 col-8'> {formateDateTimeString(data.intervention_hours)}</div>
                </div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.travel_hours')}:</div>
                    <div className='col-md-3 col-8'> {formateDateTimeString(data.travel_hours) || '--'}</div>
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.travel_distance')}:</div>
                    <div className='col-md-3 col-8'> {data.travel_distance || '--'} km</div>
                </div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.intervention_location')}:</div>
                    <div className='col-md-3 col-8'> {interventionLocationMap[data.intervention_location] || '--'}</div>
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.status')}:</div>
                    <div className='col-md-3 col-8'> {statusMap[data.status] || '--'}</div>
                </div>

                {/* {data.hourly_rate && data.currency && data.hourly_rate > 0 && ( */}
                    <div className="row">
                        <div className='col-md-2 col-4 text-end'>{t('plugin-projects.hourly_rate')}:</div>
                        <div className='col-md-3 col-8'>{data.hourly_rate && data.hourly_rate > 0 ? data.hourly_rate : '--'} {data.currency || ''}</div>
                    </div>
                {/* )} */}
            </Card.Body>
            <Card.Footer className={dark ? 'bg-secondary bg-opacity-10' : ''} style={dark ? { borderTop: '1px solid rgba(255,255,255,0.1)' } : {}}>
                <ObjectFooterView data={data} metadata={metadata} objectData={objectData} dark={dark} />
            </Card.Footer>
        </Card>
    );
}

/*
	function getDetailColumnNames() { return array('creation_date','creator','fk_progetto','father_id','fk_obj_id','name','description',
// 		'creator','creation_date','last_modify','last_modify_date',
		'fk_progetto','dalle_ore','alle_ore','ore_intervento','ore_viaggio','km_viaggio',
		'luogo_di_intervento','stato','costo_per_ora','costo_valuta',
		'owner','group_id','permissions',
	); }
*/
export function TimetrackEdit({ data, metadata, onSave, onCancel, onDelete, saving, error, dark }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: data.name || '',
        description: data.description || '',
        permissions: data.permissions || 'rwxr-x---',
        father_id: data.father_id || null,
        owner: data.owner || null,
        group_id: data.group_id || null,
        fk_project: data.fk_project || null,
        from_time: data.from_time || null,
        to_time: data.to_time || null,
        intervention_hours: data.intervention_hours || null,
        travel_hours: data.travel_hours || null,
        travel_distance: data.travel_distance || null,
        intervention_location: data.intervention_location || null,
        status: data.status || null,
        hourly_rate: data.hourly_rate || null,
        currency: data.currency || null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Accordion className="mb-3 rhobee-theme">
                <Accordion.Item eventKey="general">
                    <Accordion.Header className='rhobee-theme'>{t('common.details')}</Accordion.Header>
                    <Accordion.Body>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                            <ObjectLinkSelector
                                value={formData.father_id || '0'}
                                onChange={handleChange}
                                classname="DBObject"
                                fieldName="father_id"
                                label={t('dbobjects.parent')}
                            />
                            </div>
                            <div className="col-md-4 mb-3">
                            <ObjectLinkSelector
                                value={formData.owner}
                                onChange={handleChange}
                                classname="DBUser"
                                fieldName="owner"
                                label={t('permissions.owner')}
                                required={false}
                            />
                            </div>
                            <div className="col-md-4 mb-3">
                            <ObjectLinkSelector
                                value={formData.group_id}
                                onChange={handleChange}
                                classname="DBGroup"
                                fieldName="group_id"
                                label={t('permissions.group')}
                                required={false}
                            />
                            </div>
                        </div>

                        <PermissionsEditor
                            value={formData.permissions}
                            onChange={handleChange}
                            name="permissions"
                            label={t('permissions.current') || 'Permissions'}
                            dark={dark}
                        />

                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <Form.Group className="mb-3">
                <Form.Label>{t('common.name')}</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Accordion className='mb-3 rhobee-theme' defaultActiveKey={formData.description ? "0" : null}>
                <Accordion.Item eventKey="0" alwaysOpen>
                    <Accordion.Header className='rhobee-theme'>{t('common.description')}</Accordion.Header>
                    <Accordion.Body>
                        <Form.Control
                            as="textarea"
                            name="description"
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <ObjectLinkSelector
                        value={formData.fk_project || '0'}
                        onChange={handleChange}
                        classname="DBProject"
                        fieldName="fk_project"
                        label={t('plugin-projects.fk_project')}
                    />
                </div>
            </div>

            <div className="row">
                <div className='col-md-2 col-4 text-end'>{t('common.from')}:</div>
                <div className='col-md-3 col-8'>
                        <Form.Control
                            type="datetime-local"
                            name="from_time"
                            value={formData.from_time ? formData.from_time.substring(0,16) : ''}
                            onChange={handleChange}
                        />
                </div>
                <div className='col-md-2 col-4 text-end'>{t('common.to')}:</div>
                <div className='col-md-3 col-8'>
                    <Form.Control
                            type="datetime-local"
                            name="to_time"
                            value={formData.to_time ? formData.to_time.substring(0,16) : ''}
                            onChange={handleChange}
                        />
                </div>
            </div>

            <div className="row">
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.intervention_hours')}:</div>
                <div className='col-md-3 col-8'>
                    <TimeEdit
                        name="intervention_hours"
                        value={formData.intervention_hours || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="row">
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.travel_hours')}:</div>
                <div className='col-md-3 col-8'>
                    <TimeEdit
                        name="travel_hours"
                        value={formData.travel_hours || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.travel_distance')} (Km):</div>
                <div className='col-md-3 col-8'>
                    <Form.Control
                        type="number"
                        name="travel_distance"
                        value={formData.travel_distance || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="row">
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.intervention_location')}:</div>
                <div className='col-md-3 col-8'>
                    <Form.Select name="intervention_location" value={formData.intervention_location || ''} onChange={handleChange}>
                        <option value="">{t('common.select')}</option>
                        {Object.entries(interventionLocationMap).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </Form.Select>
                </div>
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.status')}:</div>
                <div className='col-md-3 col-8'>
                    <Form.Select name="status" value={formData.status || ''} onChange={handleChange}>
                        <option value="">{t('common.select')}</option>
                        {Object.entries(statusMap).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            <div className="row">
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.hourly_rate')}:</div>
                <div className='col-md-3 col-8'>
                    <Form.Control
                        type="number"
                        name="hourly_rate"
                        value={formData.hourly_rate || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className='col-md-2 col-4 text-end'>{t('plugin-projects.currency')}:</div>
                <div className='col-md-3 col-8'>
                    <Form.Control
                        type="text"
                        name="currency"
                        value={formData.currency || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div style={{ height: '2rem' }}></div>

            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            <div className="d-flex gap-2">
                <Button 
                    variant="primary" 
                    type="submit"
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            {t('common.saving')}
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-lg me-1"></i>
                            {t('common.save')}
                        </>
                    )}
                </Button>
                <Button 
                    variant="secondary" 
                    onClick={onCancel}
                    disabled={saving}
                >
                    <i className="bi bi-x-lg me-1"></i>
                    {t('common.cancel')}
                </Button>
                <Button 
                    variant="outline-danger" 
                    onClick={onDelete}
                    disabled={saving}
                    className="ms-auto"
                >
                    <i className="bi bi-trash me-1"></i>
                    {t('common.delete')}
                </Button>
            </div>
        </Form>
    );
}

export function Timetracks() {
  const { t } = useTranslation();
  const { dark, themeClass } = useContext(ThemeContext);
  // const [query, setQuery] = useState("");
  // const [editingFolder, setEditingFolder] = useState(null); // folder in editing

  const searchClassname = "DBTimeTrack";

  // 'fk_progetto','name','fk_obj_id','luogo_di_intervento','stato',
  const searchColumns = [
    { name: t("plugin-projects.fk_project") || "Project", attribute: "fk_project", type: "objectLink", classname: "DBProject", min_search_length: 1, hideOnSmall: false },
    { name: t("dbobjects.name") || "Name", attribute: "name", type: "string", hideOnSmall: false },
    // { name: t("dbobjects.description") || "Description", attribute: "description", type: "string", hideOnSmall: false },
    { name: t("plugin-projects.intervention_location") || "Intervention Location", attribute: "intervention_location", type: "select", options: interventionLocationMap, hideOnSmall: false },
    { name: t("plugin-projects.status") || "Status", attribute: "status", type: "select", options: statusMap, hideOnSmall: false },
    { name: t("dbobjects.parent") || "Parent", attribute: "father_id", type: "objectLink", hideOnSmall: false },

    // { name: t("dbobjects.created") || "Created", attribute: "creation_date", type: "dateSelector" },
    // { name: t("dbobjects.modified") || "Modified", attribute: "last_modify_date", type: "dateSelector" },
    // { name: t("dbobjects.deleted") || "Deleted", attribute: "deleted_date", type: "dateSelector" },
  ];

  const resultsColumns = [
    { name: t("plugin-projects.fk_project") || "Project", attribute: "fk_project", type: "objectLink", hideOnSmall: false },
    // status, from_time, to_time, name, intervention_hours, fatherid
    { name: t("plugin-projects.status") || "Status", attribute: "status", type: "map", map: statusMap, hideOnSmall: false },
    { name: t("common.from") || "From", attribute: "from_time", type: "dateTime", hideOnSmall: false },
    { name: t("common.to") || "To", attribute: "to_time", type: "dateTime", hideOnSmall: false },
    { name: t("dbobjects.name") || "Name", attribute: "name", type: "string", hideOnSmall: false },
    { name: t("plugin-projects.intervention_hours") || "Intervention Hours", attribute: "intervention_hours", type: "dateTime", hideOnSmall: true },
    { name: t("dbobjects.parent") || "Parent", attribute: "father_id", type: "objectLink", hideOnSmall: true },
    // { name: t("dbobjects.description") || "Description", attribute: "description", type: "string", hideOnSmall: true },
    // { name: t("dbobjects.created") || "Created", attribute: "creation_date", type: "dateTime", hideOnSmall: true },
    // { name: t("dbobjects.modified") || "Modified", attribute: "last_modify_date", type: "dateTime", hideOnSmall: true },
    // { name: t("dbobjects.deleted") || "Deleted", attribute: "deleted_date", type: "dateTime", hideOnSmall: true },
  ]
  return (
    <ObjectSearch searchClassname={searchClassname} searchColumns={searchColumns} resultsColumns={resultsColumns} dark={dark} themeClass={themeClass} />
    );
}
