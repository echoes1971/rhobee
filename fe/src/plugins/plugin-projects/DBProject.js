import React, { useContext, useState, useEffect } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    formateDateTimeString, 
    formatDescription, 
    classname2bootstrapIcon,
} from '../../sitenavigation_utils';
import {
  OrderBySelector, ChildrenSortOrder
} from '../../ContentWidgets';
import { ObjectSearch, ObjectHeaderView, ObjectFooterView} from "../../dbobjects/DBObject";
import ObjectLinkSelector from '../../ObjectLinkSelector'
import PermissionsEditor from '../../PermissionsEditor';
import { getErrorMessage } from "../../errorHandler";
import { HtmlView } from '../../ContentHtml';
import axiosInstance from '../../axios';
import { ThemeContext } from '../../ThemeContext';


export function ProjectView({ data, metadata, objectData, dark }) {
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
                {!data.html && data.description && <hr />}
                {data.description && (
                    <Card.Text dangerouslySetInnerHTML={{ __html: formatDescription(data.description) }}></Card.Text>
                )}
                {data.html && <hr />}
                {data.html && (
                    <HtmlView htmlContent={data.html} dark={dark} />
                )}
            </Card.Body>
            <Card.Footer className={dark ? 'bg-secondary bg-opacity-10' : ''} style={dark ? { borderTop: '1px solid rgba(255,255,255,0.1)' } : {}}>
                <ObjectFooterView data={data} metadata={metadata} objectData={objectData} dark={dark} />
            </Card.Footer>
        </Card>
    );
}

export function ProjectEdit({ data, metadata, onSave, onCancel, onDelete, saving, error, dark }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: data.name || '',
        description: data.description || '',
        permissions: data.permissions || 'rwxr-x---',
        father_id: data.father_id || null,
        owner: data.owner || null,
        group_id: data.group_id || null,
        childs_sort_order: data.childs_sort_order || null,
        childs_sort_by: data.childs_sort_by || 'name',
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

            <Form.Group className="mb-3">
                <Form.Label>{t('common.description')}</Form.Label>
                <Form.Control
                    as="textarea"
                    name="description"
                    rows={10}
                    value={formData.description}
                    onChange={handleChange}
                />
            </Form.Group>

            <ChildrenSortOrder
                father_id={data.id}
                name="childs_sort_order"
                onChange={handleChange}
                value={formData.childs_sort_order || ''}
                saving={saving}
            />

            <OrderBySelector
                value={formData.childs_sort_by || 'name'}
                onChange={handleChange}
                name="childs_sort_by"
                label={t('folder.children_sort_by')}
            />

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

export function Projects() {
  const { t } = useTranslation();
  const { dark, themeClass } = useContext(ThemeContext);
  // const [query, setQuery] = useState("");
  // const [editingFolder, setEditingFolder] = useState(null); // folder in editing

  const searchClassname = "DBProject";

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
