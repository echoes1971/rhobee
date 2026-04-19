import React, { useState, useContext } from 'react';
import { ListGroup, Card, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  classname2bootstrapIcon,
  languageCode2FlagEmoji,
  formatObjectId
 } from './sitenavigation_utils';
 import {
  ImageView
 } from './ContentWidgets';
import { app_cfg } from './app.cfg';
import axiosInstance from './axios';

/**
 * ObjectList - Reusable component to display a list of objects
 * Supports both list and card view modes, with persistent preference in localStorage
 * 
 * @param {Array} items - Array of objects to display
 * @param {Function} onItemClick - Optional custom click handler, receives (item)
 * @param {boolean} showViewToggle - Show/hide the view mode toggle buttons (default: true)
 * @param {string} storageKey - localStorage key for view mode preference (default: 'objectListViewMode')
 * @param {string} defaultView - Default view mode: 'list' or 'cards' (default: 'list')
 * @param {boolean} dark - Whether to use dark theme styles
 */
function ObjectList({ 
  items = [], 
  onItemClick = null, 
  showViewToggle = true,
  storageKey = 'objectListViewMode',
  defaultView = 'list',
  dark = false
}) {
  const navigate = useNavigate();
  // const { dark, themeClass } = useContext(ThemeContext);
  const language = localStorage.getItem("lang") || app_cfg.default_language || 'en';
  const [viewMode, setViewMode] = useState(
    localStorage.getItem(storageKey) || defaultView
  );
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [treeChildren, setTreeChildren] = useState({});

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem(storageKey, mode);
  };

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      // Default behavior: navigate to /c/{id}
      navigate(`/c/${item.id}`);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const normalizeObject = (obj) => {
      const data = obj.data || obj;
      const meta = obj.metadata || obj;

      return {
          id: data.id || obj.id,
          name: data.name || 'Untitled',
          description: meta.classname !== 'DBNote' ? data.description : '',
          classname: meta.classname || obj.classname, // || '',
          isDeleted: data.deleted_date ? true : (obj.isDeleted || false),
          language: data.language || obj.language || null,
          data: data,
          metadata: meta,
      };
  };
  // id: child.data.id,
  // name: child.data.name,
  // description: child.metadata.classname !== 'DBNote' ? child.data.description : '',
  // classname: child.metadata.classname,
  // isDeleted: child.data.deleted_date ? true : false,
  // language: child.data.language || null,

  const loadChildren = async (father_id) => {
      console.log('Loading children for:', father_id);
      try {
          const response = await axiosInstance.get(`/nav/children/${formatObjectId(father_id)}`);
          const rawChildren = response.data.children || [];
          const normalized = rawChildren.map(normalizeObject);
          console.log('Loaded children:', normalized);
          setTreeChildren(prev => ({ ...prev, [father_id]: normalized }));
      } catch (err) {
          console.error('Error loading children:', err);
      }
  };

  const toggleExpand = async (item) => {
      console.log('Toggling expand for item:', item.id);
      if (expandedItems.has(item.id)) {
          setExpandedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(item.id);
              return newSet;
          });
      } else {
          setExpandedItems(prev => new Set(prev).add(item.id));
          if (!treeChildren[item.id]) {
              await loadChildren(item.id);
          }
      }
  };

  const TreeItem = ({ item, level = 0 }) => {
      const normalized = normalizeObject(item);
      const hasChildren = treeChildren[normalized.id] && treeChildren[normalized.id].length > 0;
      const isExpanded = expandedItems.has(normalized.id);
      const itemName = normalized.name;
      const itemClassname = normalized.classname;
      const itemIsDeleted = normalized.isDeleted;
      const itemId = normalized.id;
      return (
          <div key={itemId} style={{ marginLeft: level * 20 }}>
              <div className="d-flex align-items-center" style={{ cursor: 'pointer', opacity: itemIsDeleted ? 0.6 : 1 }}>
                  <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleExpand({ id: itemId, ...item })}
                      style={{ padding: 0, marginRight: 5 }}
                  >
                      <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                  </Button>
                  <i 
                      className={`bi bi-${classname2bootstrapIcon(itemClassname)}`} 
                      style={{ fontSize: '1.5rem', marginRight: 5 }}
                  ></i>
                  <span onClick={() => handleItemClick({ id: itemId, name: itemName, classname: itemClassname, isDeleted: itemIsDeleted, ...item })}>{itemName}{itemIsDeleted ? ' (Deleted)' : ''}</span>
              </div>
              {isExpanded && treeChildren[itemId] && treeChildren[itemId].map(child => (
                (child.classname === 'DBPage' || child.classname === 'DBNews') && child.language && child.language.substring(0, 2) !== language ? null : (
                  <TreeItem key={child.data ? child.data.id : child.id} item={child} level={level + 1} />
                )
              ))}
          </div>
      );
  };

  return (
    <>
      {showViewToggle && (
        <div className="d-flex justify-content-end mb-3">
          <ButtonGroup size="sm">
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              onClick={() => handleViewModeChange('list')}
            >
              <i className="bi bi-list-ul"></i>
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'primary' : 'outline-secondary'}
              onClick={() => handleViewModeChange('cards')}
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </Button>
            <Button 
              variant={viewMode === 'tree' ? 'primary' : 'outline-secondary'}
              onClick={() => handleViewModeChange('tree')}
            >
              <i className="bi bi-diagram-3"></i>
            </Button>
          </ButtonGroup>
        </div>
      )}
      {viewMode === 'list' ? (
        <ListGroup variant={dark ? 'dark' : undefined}>
          {items.map((item) => (
            // skip if item is DBPage or DBNews and language doesn't match current language
            (item.classname === 'DBPage' || item.classname === 'DBNews') && item.language && item.language.substring(0, 2) !== language ? null : (
            <ListGroup.Item
              key={item.id}
              action
              onClick={() => handleItemClick(item)}
              style={{ cursor: 'pointer' }}
              variant={dark ? 'dark' : undefined}
            >
              <div className="d-flex justify-content-between align-items-center" style={{ opacity: item.isDeleted ? 0.6 : 1 }}>
                <div>
                  <strong>{item.name || 'Untitled'}{item.isDeleted ? ' (Deleted)' : ''}</strong>
                  {item.description && (
                    <div className="small" style={{ opacity: 0.7 }}>
                      {item.description.length > 200
                        ? item.description.substring(0, 200) + '...'
                        : item.description}
                    </div>
                  )}
                </div>
                { item.classname === 'DBFile' && (
                  <ImageView id={item.id} title={item.name || 'Image'} thumbnail={true} style={{ fontSize: '2rem', minHeight: '2rem', maxWidth: '50px', maxHeight: '50px', borderRadius: '0.5rem' }} />
                )}
                { item.classname !== 'DBFile' && (
                // <span className="badge bg-secondary">
                  <i 
                    className={`bi bi-${classname2bootstrapIcon(item.classname)}`} 
                    title={item.classname}
                    style={{ fontSize: '2rem' }}
                  ></i>
                // </span>
                )}
              </div>
            </ListGroup.Item>
          )))}
        </ListGroup>
      ) : viewMode === 'cards' ? (
        <Row>
          {items.map((item) => (
            // skip if item is DBPage or DBNews and language doesn't match current language
            (item.classname === 'DBPage' || item.classname === 'DBNews') && item.language && item.language.substring(0, 2) !== language ? null : (
            <Col key={item.id} xs={12} md={6} lg={4} className="mb-3">
              <Card 
                className="h-100"
                style={{ cursor: 'pointer', ...(item.isDeleted ? { opacity: 0.6 } : {}) }}
                onClick={() => handleItemClick(item)}
                data-bs-theme={dark? 'dark' : 'light'}
              >
                <Card.Body
                className={dark ? 'bg-secondary bg-opacity-25' : ''}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    { item.classname !== 'DBFile' && (
                      <span>
                      <i 
                      className={`bi bi-${classname2bootstrapIcon(item.classname)}`}
                      style={{ fontSize: '2rem' }}
                    ></i>
                      </span>
                    )}
                    { item.classname === 'DBFile' && (
                      <ImageView id={item.id} title={item.name || 'Image'} thumbnail={false} style={{ fontSize: '2rem', minHeight: '2rem', maxWidth: '100px', maxHeight: '100px', borderRadius: '0.25rem' }} />
                    )}
                    <span className="badge bg-secondary">
                      {(item.classname === 'DBPage' || item.classname === 'DBNews') && item.language && (
                        <>
                        <span className='pe-2'>{languageCode2FlagEmoji(item.language)}</span>
                        </>
                      )}
                      {item.classname}
                    </span>
                  </div>
                  
                  <Card.Title className="mb-2">
                    {item.name || 'Untitled'}{item.isDeleted ? ' (Deleted)' : ''}
                  </Card.Title>
                  
                  {item.description && (
                    <Card.Text className="text-secondary small">
                      {item.description.length > 150
                        ? item.description.substring(0, 150) + '...'
                        : item.description}
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )))}
        </Row>
      ) : viewMode === 'tree' ? (
        <div>
          {items.map((item) => (
            // skip if item is DBPage or DBNews and language doesn't match current language
            (item.classname === 'DBPage' || item.classname === 'DBNews') && item.language && item.language.substring(0, 2) !== language ? null : (
              <TreeItem key={item.id} item={item} />
            )
          ))}
        </div>
      ) : null
      }
    </>
  );
}

export default ObjectList;
