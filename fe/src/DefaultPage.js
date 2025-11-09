import React, { useState } from "react";
import { useTranslation } from "react-i18next";


function DefaultPage() {
    const { t } = useTranslation();
    return (
        <div className="p-3">
            <h3>Benvenuto nella nostra applicazione!</h3>
            <p>Per favore, effettua il login per continuare.</p>
        </div>
    );
}

export default DefaultPage;
