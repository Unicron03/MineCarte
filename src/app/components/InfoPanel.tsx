import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/shadcn/ui/accordion"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/shadcn/ui/avatar"
import MarkdownViewer from "./MarkdownViewer";
import { Info } from "lucide-react"

export default function InfoPanel() {
    const [open, setOpen] = React.useState(false)

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button title="Infos" onClick={() => setOpen(false)}>
                    <Info className="hover:opacity-60 cursor-pointer" size={24}/>
                </button>
            </DialogTrigger>
            <DialogContent
                className="w-fit max-h-[80vh] h-auto"
                style={{ scrollbarColor: "#80808057 transparent" }}
            >
                <DialogHeader className="">
                    <DialogTitle>Documentation</DialogTitle>
                    <DialogDescription>
                        <p className="text-[#a1a1a1]">Ici vous pouvez accéder à la documentation du logiciel</p>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Voir la documentation</AccordionTrigger>
                                <AccordionContent className="max-h-[50vh] overflow-y-auto">
                                    <div className="flex flex-col gap-4">
                                        <MarkdownViewer filePath = "/documentations/app.md" />

                                        <p>Contributeurs au projet :</p>
                                        <div className="*:data-[slot=avatar]:ring-background flex -space-x-1.5 *:data-[slot=avatar]:ring-1">
                                            <Avatar onClick={() => window.open("https://github.com/unicron03")} className="cursor-pointer z-40" title="Enzo VANDEPOELE">
                                                <AvatarImage src="https://github.com/unicron03.png" alt="@unicron" />
                                                <AvatarFallback>Enzo VANDEPOELE</AvatarFallback>
                                            </Avatar>
                                            <Avatar onClick={() => window.open("https://github.com/johnmclf")} className="cursor-pointer z-30" title="John MICALLEF">
                                                <AvatarImage src="https://github.com/johnmclf.png" alt="@johnmclf" />
                                                <AvatarFallback>John MICALLEF</AvatarFallback>
                                            </Avatar>
                                            <Avatar onClick={() => window.open("https://github.com/jores02")} className="cursor-pointer z-20" title="Amen AHOUANDOGBO">
                                                <AvatarImage src="https://github.com/jores02.png" alt="@jores02" />
                                                <AvatarFallback>Amen AHOUANDOGBO</AvatarFallback>
                                            </Avatar>
                                            <Avatar onClick={() => window.open("https://github.com/cherifaaa")} className="cursor-pointer z-10" title="Cherifa SAFI">
                                                <AvatarImage src="https://github.com/cherifaaa.png" alt="@cherifaaa" />
                                                <AvatarFallback>Cherifa SAFI</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}