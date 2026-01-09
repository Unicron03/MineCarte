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

export default function EditPseudoDialog({
    userId,
    currentPseudo
}: {
    userId: number;
    currentPseudo: string;
}) {
    const [open, setOpen] = useState(false);
    const [newPseudo, setNewPseudo] = useState(currentPseudo);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdate = async () => {
        setError(null);

        if (newPseudo.trim().length < 2 || newPseudo.trim().length > 15) {
            setError("Le pseudo doit contenir entre 2 et 15 caractères");
            return;
        }

        if (newPseudo.trim() === currentPseudo) {
            setOpen(false);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/user/updatePseudo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newPseudo: newPseudo.trim() })
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
                <Button variant="link" size="icon">
                    <Pencil />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier le pseudo</DialogTitle>
                    <DialogDescription>
                        Choisissez un nouveau pseudo (2-15 caractères)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pseudo" className="text-right">
                            Pseudo
                        </Label>
                        <Input
                            id="pseudo"
                            value={newPseudo}
                            onChange={(e) => {
                                setNewPseudo(e.target.value);
                                setError(null);
                            }}
                            className="col-span-3"
                            placeholder="Nouveau pseudo"
                            minLength={2}
                            maxLength={15}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdate();
                                }
                            }}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <p className="text-sm text-gray-500 text-center">
                        {newPseudo.length}/15 caractères
                    </p>
                </div>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                            setOpen(false);
                            setNewPseudo(currentPseudo);
                            setError(null);
                        }}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button 
                        type="submit" 
                        onClick={handleUpdate}
                        disabled={isLoading || newPseudo.trim().length < 2 || newPseudo.trim().length > 15}
                    >
                        {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}