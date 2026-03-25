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
  ObjectView,
  UserLinkView,
} from '../../ContentWidgets';
import { ObjectSearch, ObjectHeaderView, ObjectFooterView } from "../../dbobjects/DBObject";
import ObjectLinkSelector from '../../ObjectLinkSelector'
import PermissionsEditor from '../../PermissionsEditor';
import { getErrorMessage } from "../../errorHandler";
import { HtmlView } from '../../ContentHtml';
import axiosInstance from '../../axios';
import { ThemeContext } from '../../ThemeContext';


export function TodoView({ data, metadata, objectData, dark }) {
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
                <hr />
                <div className="row">
                     <div className='col-md-2 col-4 text-end'>{t('plugin-projects.priority')}:</div>
                     <div className='col-md-3 col-8'>{data.priority}</div>
                </div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.reported_date')}:</div>
                    <div className='col-md-3 col-8'> {formateDateTimeString(data.reported_date)}</div>
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.fk_reported_by')}:</div>
                    <div className='col-md-3 col-8'><ObjectLinkView obj_id={data.fk_reported_by} dark={dark} /></div>
                </div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.fk_customer')}:</div>
                    <div className='col-md-3 col-8'><ObjectLinkView obj_id={data.fk_customer} dark={dark} /></div>
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.fk_project')}:</div>
                    <div className='col-md-3 col-8'><ObjectLinkView obj_id={data.fk_project} dark={dark} /></div>
                </div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.fk_type')}:</div>
                    <div className='col-md-3 col-8'><ObjectView obj_id={data.fk_type} dark={dark} /></div>
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.status')}:</div>
                    <div className='col-md-3 col-8'>{data.status} %</div>
                </div>
                {data.todo_description && (
                    <>
                        <div className="row">&nbsp;</div>
                        <div className="row">
                            <div className='col-md-2 col-4 text-end'>{t('plugin-projects.todo_description')}: </div>
                            <div className='col-md-10 col-8' dangerouslySetInnerHTML={{ __html: formatDescription(data.todo_description) }} />
                        </div>
                    </>
                )}
                {data.intervention && (
                    <>
                    <div className="row">&nbsp;</div>
                    <div className="row">
                        <div className='col-md-2 col-4 text-end'>{t('plugin-projects.intervention')}: </div>
                        <div className='col-md-10 col-8' dangerouslySetInnerHTML={{ __html: formatDescription(data.intervention) }} />
                    </div>
                    </>
                )}
                {data.closed_date && data.closed_date !== '0000-00-00 00:00:00' && (
                    <>
                <div className="row">&nbsp;</div>
                <div className="row">
                    <div className='col-md-2 col-4 text-end'>{t('plugin-projects.closed_date')}: </div>
                    <div className='col-md-3 col-8' >{formateDateTimeString(data.closed_date)}</div>
                </div>
                </>
                )}
            </Card.Body>
            <Card.Footer className={dark ? 'bg-secondary bg-opacity-10' : ''} style={dark ? { borderTop: '1px solid rgba(255,255,255,0.1)' } : {}}>
                <ObjectFooterView data={data} metadata={metadata} objectData={objectData} dark={dark} />
            </Card.Footer>
        </Card>
    );
}

/*
	function getDetailColumnNames() { return array('name',
// 		'creator','creation_date','last_modify','last_modify_date','description','fk_obj_id',
		'priority','reported_date','fk_reported_by','fk_customer','fk_project','fk_type','status','todo_description','intervention','closed_date',
		'owner','group_id','permissions',
	); }
 */

export function TodoEdit({ data, metadata, onSave, onCancel, onDelete, saving, error, dark }) {
    const { t } = useTranslation();
    const { themeClass } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        name: data.name || '',
        priority: data.priority || '',
        reported_date: data.reported_date || '',
        fk_reported_by: data.fk_reported_by || '',
        fk_customer: data.fk_customer || '',
        fk_project: data.fk_project || '',
        fk_type: data.fk_type || '',
        status: data.status || '',
        todo_description: data.todo_description || '',
        intervention: data.intervention || '',
        closed_date: data.closed_date || '',
        permissions: data.permissions || 'rwxr-x---',
        father_id: data.father_id || null,
        owner: data.owner || null,
        group_id: data.group_id || null,
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
            <Alert variant="info" className="mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Editing {metadata.classname} - Think which fields you want to edit, and fill only those.
            </Alert>

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

            <div className="row">
                <div className="col-md-6 mb-3">
                    <Form.Group className="mb-3">
                        <Form.Label>{t('plugin-projects.priority')}: {formData.priority || 0}</Form.Label>
                        {/* <Form.Control
                            as="input"
                            type="number"
                            name="priority"
                            min="0"
                            max="10"
                            value={formData.priority || ''}
                            onChange={handleChange}
                        /> */}
                        <Form.Range 
                            name="priority"
                            value={formData.priority || 0}
                            onChange={e => { handleChange(e); }}
                            min={0}
                            max={10}
                            step={1}
                        />
                    </Form.Group>
                </div>
                <div className="col-md-6 mb-3">
                    <ObjectLinkSelector
                        value={formData.fk_type || '0'}
                        onChange={handleChange}
                        classname="DBTodoTipo"
                        fieldName="fk_type"
                        label={t('plugin-projects.fk_type')}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <Form.Group>
                        <Form.Label>{t('plugin-projects.reported_date')}</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="reported_date"
                            value={formData.reported_date ? formData.reported_date.replace(' ', 'T') : ''}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>
                <div className="col-md-6 mb-3">
                    <ObjectLinkSelector
                        value={formData.fk_reported_by || '0'}
                        onChange={handleChange}
                        classname="DBPerson"
                        fieldName="fk_reported_by"
                        label={t('plugin-projects.fk_reported_by')}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <Form.Group>
                        <Form.Label>{t('plugin-projects.status')} {formData.status || 0}%</Form.Label>
                        {/* <Form.Control
                            type="number"
                            name="status"
                            min="0"
                            max="100"
                            value={formData.status || ''}
                            onChange={handleChange}
                        /> */}
                        <Form.Range 
                            name="status"
                            value={formData.status}
                            onChange={e => { handleChange(e); }}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </Form.Group>
                </div>
                <div className="col-md-6 mb-3">
                    <Form.Group className="mb-3">
                        <Form.Label>{t('plugin-projects.closed_date')}</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="closed_date"
                            value={formData.closed_date ? formData.closed_date.replace(' ', 'T') : ''}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </div>
            </div>

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

            <Accordion className='mb-3' defaultActiveKey="0">
                <Accordion.Item eventKey="0" className={themeClass} alwaysOpen>
                    <Accordion.Header>{t('plugin-projects.todo_description')}</Accordion.Header>
                    <Accordion.Body>
                        <Form.Control
                            as="textarea"
                            name="todo_description"
                            rows={5}
                            value={formData.todo_description}
                            onChange={handleChange}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <Accordion className='mb-3'>
                <Accordion.Item eventKey="0" className={themeClass}>
                    <Accordion.Header>{t('plugin-projects.intervention')}</Accordion.Header>
                    <Accordion.Body>
                        <Form.Control
                            as="textarea"
                            name="intervention"
                            rows={5}
                            value={formData.intervention}
                            onChange={handleChange}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <ObjectLinkSelector
                        value={formData.fk_customer || '0'}
                        onChange={handleChange}
                        classname="DBCustomer"
                        fieldName="fk_customer"
                        label={t('plugin-projects.fk_customer')}
                    />
                </div>
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

export function Todos() {
  const { t } = useTranslation();
  const { dark, themeClass } = useContext(ThemeContext);
  // const [query, setQuery] = useState("");
  // const [editingFolder, setEditingFolder] = useState(null); // folder in editing

  const searchClassname = "DBTodo";

  const searchColumns = [
    { name: t("dbobjects.name") || "Name", attribute: "name", type: "string" },
    { name: t("dbobjects.description") || "Description", attribute: "description", type: "string" },
    { name: t("dbobjects.parent") || "Parent", attribute: "father_id", type: "objectLink" },
    { name: t("dbobjects.created") || "Created", attribute: "creation_date", type: "dateSelector" },
    { name: t("dbobjects.modified") || "Modified", attribute: "last_modify_date", type: "dateSelector" },
    { name: t("dbobjects.deleted") || "Deleted", attribute: "deleted_date", type: "dateSelector" },
  ];

  const resultsColumns = [
    { name: t("dbobjects.parent") || "Parent", attribute: "father_id", type: "objectLink", hideOnSmall: true },
    { name: t("dbobjects.name") || "Name", attribute: "name", type: "string", hideOnSmall: false },
    { name: t("dbobjects.description") || "Description", attribute: "description", type: "string", hideOnSmall: true },
    { name: t("dbobjects.created") || "Created", attribute: "creation_date", type: "dateSelector", hideOnSmall: true },
    { name: t("dbobjects.modified") || "Modified", attribute: "last_modify_date", type: "dateSelector", hideOnSmall: true },
    { name: t("dbobjects.deleted") || "Deleted", attribute: "deleted_date", type: "dateSelector", hideOnSmall: true },
  ]
  return (
    <ObjectSearch searchClassname={searchClassname} searchColumns={searchColumns} resultsColumns={resultsColumns} dark={dark} themeClass={themeClass} />
    );
}
