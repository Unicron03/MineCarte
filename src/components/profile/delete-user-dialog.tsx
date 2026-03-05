"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import { toast } from "react-toastify";

export default function DeleteUserDialog({
    userId
}: {
    userId: string
}) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/user/deleteUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                router.push('/');
                toast.success("Compte supprimé avec succès !",
                    {
                        progressClassName: "fancy-progress-bar",
                        closeOnClick: true,
                        autoClose: 3000,
                        theme: localStorage.getItem("theme") || "light"
                    }
                );
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="glass-nav w-120 h-auto !py-4 !px-6 after:!rounded-lg !rounded-lg flex flex-col items-start text-white">
                    <span className="font-medium text-base">
                        Supprimer mon compte
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Êtes-vous sûr de vouloir supprimer votre compte ?</DialogTitle>
                </DialogHeader>
                <DialogFooter className="justify-end">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                            setOpen(false);
                        }}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        type="submit" 
                        onClick={handleUpdate}
                    >
                        {isLoading ? "Suppression..." : "Supprimer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}