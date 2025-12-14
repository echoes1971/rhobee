import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup, ListGroup, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axiosInstance from './axios';

/**
 * File selector modal for inserting files/images into content
 * Only shows files where user has WRITE permission (to avoid unauthorized embedding)
 * 
 * @param {boolean} show - Whether modal is visible
 * @param {function} onHide - Callback when modal closes
 * @param {function} onSelect - Callback when file is selected (file object)
 * @param {string} fileType - 'image' or 'file' to filter by MIME type
 */
function FileSelector({ show, onHide, onSelect, fileType = 'file' }) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    // Search for files
    const handleSearch = async (term) => {
        setSearchTerm(term);
        
        if (term.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.get('/objects/search', {
                params: {
                    classname: 'DBFile',
                    name: term,
                    limit: 20,
                    type: 'link' // Only files with write permission
                }
            });

            if (response.data.success && response.data.objects) {
                let files = response.data.objects;
                
                // Filter by file type if specified
                if (fileType === 'image') {
                    // Filter by MIME type (images start with 'image/')
                    files = files.filter(file => {
                        return file.mime && file.mime.startsWith('image/');
                    });
                }
                
                setResults(files);
            }
        } catch (error) {
            console.error('File search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Select a file
    const handleSelect = (file) => {
        onSelect(file);
        setSearchTerm('');
        setResults([]);
        onHide();
    };

    // Handle modal close
    const handleClose = () => {
        setSearchTerm('');
        setResults([]);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {fileType === 'image' ? (
                        <>
                            <i className="bi bi-image me-2"></i>
                            {t('files.select_image') || 'Select Image'}
                        </>
                    ) : (
                        <>
                            <i className="bi bi-file-earmark me-2"></i>
                            {t('files.select_file') || 'Select File'}
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <InputGroup>
                        <Form.Control
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={t('common.search') || 'Search...'}
                            autoFocus
                        />
                        {loading && (
                            <InputGroup.Text>
                                <Spinner animation="border" size="sm" />
                            </InputGroup.Text>
                        )}
                    </InputGroup>
                    <Form.Text className="text-secondary">
                        {fileType === 'image' 
                            ? (t('files.search_images_hint') || 'Search for images (only files you can edit)')
                            : (t('files.search_files_hint') || 'Search for files (only files you can edit)')
                        }
                    </Form.Text>
                </Form.Group>

                {results.length > 0 && (
                    <ListGroup>
                        {results.map((file) => (
                            <ListGroup.Item
                                key={file.id}
                                action
                                onClick={() => handleSelect(file)}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <i className="bi bi-file-earmark me-2"></i>
                                    <strong>{file.name}</strong>
                                    {file.description && (
                                        <small className="text-secondary d-block ms-4">
                                            {file.description}
                                        </small>
                                    )}
                                </div>
                                <i className="bi bi-chevron-right"></i>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

                {searchTerm.length >= 2 && !loading && results.length === 0 && (
                    <div className="text-center text-secondary py-4">
                        <i className="bi bi-search fs-1 d-block mb-2"></i>
                        {t('common.no_results') || 'No results found'}
                    </div>
                )}

                {searchTerm.length < 2 && (
                    <div className="text-center text-secondary py-4">
                        <i className="bi bi-info-circle fs-1 d-block mb-2"></i>
                        {t('files.type_to_search') || 'Type at least 2 characters to search'}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    {t('common.cancel') || 'Cancel'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FileSelector;
