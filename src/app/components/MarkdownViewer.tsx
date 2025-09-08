import React, { useEffect, useState } from "react";
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import "highlight.js/styles/github.css";

export default function MarkdownViewer({ filePath }: { filePath: string }) {
    const [content, setContent] = useState("");
    const [id] = useState('preview-only');

    useEffect(() => {
        fetch(filePath)
            .then((res) => {
                if (!res.ok) throw new Error(`Fichier introuvable : ${filePath}`);
                return res.text();
            })
            .then(setContent)
            .catch((err) => {
                console.error("Erreur lors du chargement du .md :", err);
                setContent(`# Erreur\nImpossible de charger le fichier Markdown.`);
            });
    }, [filePath]);

    return (
        <div className="prose dark:prose-invert max-w-[inherit] max-h-[inherit] overflow-y-auto" style={{paddingInline: "0.6rem"}}>
            <MdPreview id={id} modelValue={content} />
        </div>
    );
}