import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "./ThemeContext";

/**
 * AssociationManager - Componente riusabile per gestire relazioni many-to-many
 * 
 * @param {string} title - Titolo del box (es. "Groups", "Users")
 * @param {Array} available - Lista di tutti gli item disponibili
 * @param {Array} selected - Array di ID degli item selezionati
 * @param {Function} onChange - Callback quando cambia la selezione: (newSelectedIds) => void
 * @param {string} labelKey - Nome della proprietà da usare come label (es. "name", "fullname")
 * @param {string} valueKey - Nome della proprietà da usare come valore (es. "id")
 * @param {boolean} disabled - Se true, disabilita la modifica
 * @param {boolean} compact - Se true o available.length > 100, usa modalità compatta (solo selezionati + ricerca)
 */
function AssociationManager({ 
    title, 
    available = [], 
    selected = [], 
    onChange, 
    labelKey = "name", 
    valueKey = "id",
    disabled = false,
    compact = null // auto-detect se null
}) {
    const { t } = useTranslation();
    const { themeClass } = useContext(ThemeContext);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Auto-detect compact mode se non specificato
    const isCompactMode = compact !== null ? compact : available.length > 5;

    // Filtra gli item disponibili in base alla ricerca
    const filteredAvailable = available.filter(item => 
        item[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Separa in selezionati e non selezionati
    const selectedItems = isCompactMode 
        ? available.filter(item => selected.includes(item[valueKey]))
        : filteredAvailable.filter(item => selected.includes(item[valueKey]));
    
    const unselectedItems = filteredAvailable.filter(item => 
        !selected.includes(item[valueKey])
    );

    // In modalità compatta, mostra solo i primi N risultati non selezionati
    const displayUnselectedItems = isCompactMode 
        ? (searchTerm ? unselectedItems.slice(0, 10) : []) // In compact mode, mostra items solo se c'è una ricerca
        : unselectedItems;

    const handleToggle = (itemId) => {
        if (disabled) return;
        
        const newSelected = selected.includes(itemId)
            ? selected.filter(id => id !== itemId)
            : [...selected, itemId];
        
        onChange(newSelected);
    };

    const handleSelectAll = () => {
        if (disabled) return;
        const allIds = available.map(item => item[valueKey]);
        onChange(allIds);
    };

    const handleDeselectAll = () => {
        if (disabled) return;
        onChange([]);
    };

    return (
        <div className={`card mb-3 ${themeClass}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{title}</h5>
                <span className="badge bg-primary">{selected.length} / {available.length}</span>
            </div>
            <div className="card-body">
                {/* Search bar */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={t("common.search") || "Search..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={disabled}
                    />
                </div>

                {/* Bulk actions */}
                <div className="mb-3">
                    <button 
                        className="btn btn-sm btn-outline-primary me-2" 
                        onClick={handleSelectAll}
                        disabled={disabled}
                    >
                        {t("common.select_all") || "Select All"}
                    </button>
                    <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={handleDeselectAll}
                        disabled={disabled}
                    >
                        {t("common.deselect_all") || "Deselect All"}
                    </button>
                    {isCompactMode && (
                        <span className="ms-3 text-muted small">
                            {t("association.compact_mode") || "Compact mode"} - {t("association.search_to_add_more") || "Search to add more"}
                        </span>
                    )}
                </div>

                {/* Lista items selezionati */}
                {selectedItems.length > 0 && (
                    <div className="mb-3">
                        <h6 className="text-success">{t("common.selected") || "Selected"}</h6>
                        <div className="list-group">
                            {selectedItems.map(item => (
                                <div 
                                    key={item[valueKey]} 
                                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${themeClass}`}
                                    onClick={() => handleToggle(item[valueKey])}
                                    style={{ cursor: disabled ? 'default' : 'pointer' }}
                                >
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            checked={true}
                                            onChange={() => {}}
                                            disabled={disabled}
                                        />
                                        <label className="form-check-label">
                                            {item[labelKey]}
                                        </label>
                                    </div>
                                    {!disabled && (
                                        <span className="badge bg-success">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista items non selezionati */}
                {!isCompactMode && displayUnselectedItems.length > 0 && (
                    <div>
                        <h6 className="text-muted">{t("common.available") || "Available"}</h6>
                        <div className="list-group">
                            {displayUnselectedItems.map(item => (
                                <div 
                                    key={item[valueKey]} 
                                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${themeClass}`}
                                    onClick={() => handleToggle(item[valueKey])}
                                    style={{ cursor: disabled ? 'default' : 'pointer' }}
                                >
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            checked={false}
                                            onChange={() => {}}
                                            disabled={disabled}
                                        />
                                        <label className="form-check-label">
                                            {item[labelKey]}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modalità compatta: risultati della ricerca */}
                {isCompactMode && (
                    <div>
                        {!searchTerm && (
                            <div className="alert alert-info">
                                <i className="bi bi-search me-2"></i>
                                {t("association.search_to_add_items") || "Use the search bar above to find and add items"}
                            </div>
                        )}
                        {searchTerm && displayUnselectedItems.length > 0 && (
                            <div>
                                <h6 className="text-muted">
                                    {t("common.search_results") || "Search Results"}
                                    {unselectedItems.length > 10 && (
                                        <span className="ms-2 small">
                                            ({t("common.showing") || "Showing"} {displayUnselectedItems.length} {t("common.of") || "of"} {unselectedItems.length})
                                        </span>
                                    )}
                                </h6>
                                <div className="list-group">
                                    {displayUnselectedItems.map(item => (
                                        <div 
                                            key={item[valueKey]} 
                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${themeClass}`}
                                            onClick={() => handleToggle(item[valueKey])}
                                            style={{ cursor: disabled ? 'default' : 'pointer' }}
                                        >
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    checked={false}
                                                    onChange={() => {}}
                                                    disabled={disabled}
                                                />
                                                <label className="form-check-label">
                                                    {item[labelKey]}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {unselectedItems.length > displayUnselectedItems.length && (
                                    <p className="text-muted text-center mt-2 small">
                                        {t("association.refine_search") || "Refine your search to see more results"}
                                    </p>
                                )}
                            </div>
                        )}
                        {searchTerm && displayUnselectedItems.length === 0 && selectedItems.length > 0 && (
                            <p className="text-muted text-center mb-0">
                                {t("common.no_matches") || "No matches found"}
                            </p>
                        )}
                    </div>
                )}

                {/* Nessun risultato */}
                {filteredAvailable.length === 0 && (
                    <p className="text-muted text-center mb-0">
                        {t("common.no_items_found") || "No items found"}
                    </p>
                )}
            </div>
        </div>
    );
}

export default AssociationManager;
