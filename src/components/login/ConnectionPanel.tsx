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
import { ConnexionForm, connexionSchema } from "@/components/utils/schema"
import { signIn } from "@/lib/auth-client";
import { useState } from "react"
import { useAuthPanel } from "./AuthPanelContext"
import Image from "next/image";

export function ConnectionPanel() {
    const router = useRouter()
    const { openConnectionPanel, setOpenConnectionPanel, switchToInscription } = useAuthPanel()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ConnexionForm>({
        validate: zodResolver(connexionSchema),
        initialValues: {
            email: "",
            password: "",
        },
    })

    const handleSubmit = async (values: ConnexionForm) => {
        setIsLoading(true)

        try {
            const { error } = await signIn.email({
                email: values.email,
                password: values.password,
            })

            if (error) {
                toast.error("Ces identifiants ne correspondent à aucun utilisateur connu.", {
                    progressClassName: "fancy-progress-bar",
                    closeOnClick: true,
                    autoClose: 10000,
                    theme: localStorage.getItem("theme") || "light"
                })
                return
            }

            toast.success(
                <span>Connexion réussie. Bienvenue 👋</span>,
                {
                    progressClassName: "fancy-progress-bar",
                    closeOnClick: true,
                    autoClose: 3000,
                    theme: localStorage.getItem("theme") || "light"
                }
            )
            setOpenConnectionPanel(false)
            router.push("/home")
            router.refresh()
        } catch (error) {
            console.error("Erreur lors de la connexion :", error)
            toast.error("Une erreur est survenue lors de la connexion.", {
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
        <Dialog open={openConnectionPanel} onOpenChange={setOpenConnectionPanel}>
            <DialogTrigger asChild>
                <Button className="hover:opacity-60 bg-black dark:bg-white text-white dark:text-black border-white border-2 p-1.5 h-[45px] flex items-center">
                    {/* Logo thème clair */}
                    <Image
                        src="/logo.png"
                        alt="Login icon"
                        width={35}
                        height={35}
                        className="mr-2 block dark:hidden"
                    />

                    {/* Logo thème sombre */}
                    <Image
                        src="/logo_black.png"
                        alt="Login icon"
                        width={35}
                        height={35}
                        className="mr-2 hidden dark:block"
                    />

                    Se connecter
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[475px] h-fit bg-white dark:bg-black">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Connexion</DialogTitle>
                        <DialogDescription className="text-[#a1a1a1]">
                            Connectez-vous pour accéder à votre collection MineCarte.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 my-4">
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
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </DialogFooter>

                    <DialogFooter className="mt-4 justify-center">
                        <div className="flex justify-center flex-col">
                            <Button
                                variant="link"
                                className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                onClick={switchToInscription}
                                type="button"
                            >
                                Pas encore de compte ? Inscrivez-vous !
                            </Button>

                            <Button
                                variant="link"
                                className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                onClick={() => {
                                    setOpenConnectionPanel(false)
                                    router.push("/reset-password")
                                }}
                                type="button"
                            >
                                Mot de passe oublié ?
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}