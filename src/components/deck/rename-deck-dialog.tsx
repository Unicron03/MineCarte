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
import { DropdownMenuItem } from "@/shadcn/ui/dropdown-menu";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";

export default function RenameDeckDialog({
    deckId,
    currentName
}: {
    deckId: number;
    currentName: string | null;
}) {
    const [open, setOpen] = useState(false);
    const [newName, setNewName] = useState(currentName || "");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRename = async () => {
        if (newName.trim().length === 0) {
            alert("Le nom ne peut pas être vide");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/decks/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deckId, newName })
            });

            const data = await response.json();

            if (response.ok) {
                setOpen(false);
                router.refresh();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Erreur lors du renommage:", error);
            alert("Erreur lors du renommage du deck");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}>
                    Renommer
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Renommer le deck</DialogTitle>
                    <DialogDescription>
                        Donnez un nouveau nom à votre deck
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nom
                        </Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="col-span-3"
                            placeholder="Nom du deck"
                            maxLength={50}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                        />
                    </div>
                </div>
                <DialogFooter className="justify-end">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button 
                        type="submit" 
                        onClick={handleRename}
                        disabled={isLoading}
                    >
                        {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}