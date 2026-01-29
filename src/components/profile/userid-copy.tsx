"use client"

import { toast } from "react-toastify";

interface UserIdCopyProps {
    id: number | string;
}

export default function UserIdCopy({ id }: UserIdCopyProps) {
    const idStr = id.toString();
    const displayId = idStr.length > 6 ? `${idStr.slice(0, 6)}...` : idStr;

    const handleCopy = () => {
        navigator.clipboard.writeText(idStr);
        // Optionnel : ajoute un toast ici si tu veux
        toast.success("ID copié dans le presse-papiers !",
            {
                progressClassName: "fancy-progress-bar",
                closeOnClick: true,
                autoClose: 3000,
                theme: localStorage.getItem("theme") || "light"
            }
        );
    };

    return (
        <button
            onClick={handleCopy}
            className="underline hover:text-primary transition-colors cursor-pointer"
            title="Cliquer pour copier l'ID"
        >
            {displayId}
        </button>
    );
}