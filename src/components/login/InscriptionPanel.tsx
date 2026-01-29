"use client";

import { useForm, zodResolver } from "@mantine/form"
import { Button } from "@/shadcn/ui/button" 
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog"
import { Input } from "@/shadcn/ui/input"
import { Label } from "@/shadcn/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { InscriptionForm, inscriptionSchema } from "@/components/utils/schema"
import { signUp } from "@/lib/auth-client"
import { useState } from "react"
import { useAuthPanel } from "./AuthPanelContext"

export function InscriptionPanel() {
    const router = useRouter()
    const { openInscriptionPanel, setOpenInscriptionPanel, switchToConnection } = useAuthPanel()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<InscriptionForm>({
        validate: zodResolver(inscriptionSchema),
        initialValues: {
            pseudo: "",
            email: "",
            password: "",
        },
    })

    const handleSubmit = async (values: InscriptionForm) => {
        setIsLoading(true)

        try {
            await signUp.email({
                email: values.email,
                password: values.password,
                name: values.pseudo,
            }, {
                onRequest: () => {
                    // Loading déjà géré par isLoading
                },
                onSuccess: () => {
                    toast.success(
                        <span>Inscription réussie. Bienvenue 👋</span>,
                        {
                            progressClassName: "fancy-progress-bar",
                            closeOnClick: true,
                            autoClose: 3000,
                            theme: localStorage.getItem("theme") || "light"
                        }
                    )
                    setOpenInscriptionPanel(false)
                    router.push("/home")
                    router.refresh()
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "Une erreur est survenue lors de l'inscription.", {
                        progressClassName: "fancy-progress-bar",
                        closeOnClick: true,
                        autoClose: 10000,
                        theme: localStorage.getItem("theme") || "light"
                    })
                }
            })
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error)
            toast.error("Une erreur est survenue lors de l'inscription.", {
                progressClassName: "fancy-progress-bar",
                closeOnClick: true,
                autoClose: 10000,
                theme: localStorage.getItem("theme") || "light"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={openInscriptionPanel} onOpenChange={setOpenInscriptionPanel}>
            <DialogTrigger asChild>
                <Button className="hover:opacity-60 bg-black dark:bg-white text-white dark:text-black">
                    S&apos;inscrire
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[475px] h-fit bg-white dark:bg-black">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Inscription</DialogTitle>
                        <DialogDescription className="text-[#a1a1a1]">
                            Inscrivez-vous pour commencer à collectionner des cartes !
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 my-4">
                        <div className="grid gap-3">
                            <Label htmlFor="pseudo-input">Pseudo</Label>
                            <Input
                                id="pseudo-input"
                                type="text"
                                placeholder="Votre pseudo"
                                {...form.getInputProps("pseudo")}
                            />
                            {form.errors.pseudo && (
                                <span className="text-sm text-red-500">{form.errors.pseudo}</span>
                            )}
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="email-input">Adresse email</Label>
                            <Input
                                id="email-input"
                                type="email"
                                placeholder="super.exemple@gmail.com"
                                {...form.getInputProps("email")}
                            />
                            {form.errors.email && (
                                <span className="text-sm text-red-500">{form.errors.email}</span>
                            )}
                        </div>

                        <div className="grid gap-3 relative">
                            <Label htmlFor="password-input">Mot de passe</Label>
                            <Input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Votre mot de passe"
                                className="pr-10"
                                {...form.getInputProps("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-[33px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                            {form.errors.password && (
                                <span className="text-sm text-red-500">{form.errors.password}</span>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                className="hover:opacity-60 bg-black dark:bg-white text-white dark:text-black"
                                style={{ outlineWidth: "0.15rem", outlineOffset: "-1px" }}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            className="hover:opacity-60 bg-black dark:bg-white text-white dark:text-black"
                            disabled={isLoading}
                        >
                            {isLoading ? "Inscription..." : "S'inscrire"}
                        </Button>
                    </DialogFooter>

                    <DialogFooter className="mt-4 justify-center">
                        <Button
                            variant="link"
                            className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            onClick={switchToConnection}
                            type="button"
                        >
                            Déjà un compte ? Connectez-vous !
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}