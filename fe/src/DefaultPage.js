import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


function DefaultPage() {
    const { t } = useTranslation();

    // Use ollama response for default page content
    const [content, setContent] = useState("");

    const language = localStorage.getItem("lang") || "en";
    
    useEffect(() => {
        fetch("/api/ollama/defaultpage?lang=" + language)
            .then((response) => response.json())
            .then((data) => {
                setContent(data.response);
            })
            .catch((error) => {
                console.error("Error fetching default page content:", error);
            });
    }, []);

    if (content) {
        return (
            <div className="p-3 d-flex justify-content-center">
                <div className="col-12 col-md-9 col-lg-8" dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        );
    }

    return (
        <div className="p-3 d-flex justify-content-center">
            <div className="col-12 col-md-9 col-lg-8">
                <h3>Welcome to our application!</h3>
                <p>Please log in to continue.</p>
            </div>
        </div>
    );
}

export default DefaultPage;
