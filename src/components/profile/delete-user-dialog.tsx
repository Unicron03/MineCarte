"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Pencil } from "lucide-react";

export default function DeleteUserDialog({
    userId
}: {
    userId: number
}) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdate = async () => {
        setError(null);

        setIsLoading(true);

        try {
            const response = await fetch('/api/user/updatePseudo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (response.ok) {
                setOpen(false);
                router.refresh();
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du pseudo:", error);
            setError("Erreur lors de la mise à jour du pseudo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="glass-nav w-120 !py-4 !px-6 after:!rounded-lg !rounded-lg flex flex-col items-start text-white">
                    <span className="font-medium">
                        Supprimer mon compte
                    </span>
                </button>
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
                            setError(null);
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