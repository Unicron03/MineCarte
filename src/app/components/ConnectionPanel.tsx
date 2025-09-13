// import { useRef, useState } from "react"
// import { Button } from "@/shadcn/ui/button" 
// import {
//     Dialog,
//     DialogClose,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/shadcn/ui/dialog"
// import { Input } from "@/shadcn/ui/input"
// import { Label } from "@/shadcn/ui/label"
// import { Eye, EyeOff } from "lucide-react"
// import { toast } from "react-toastify"
// // import { useUser } from "@/context/UserContext"
// import { useNavigate } from "react-router-dom"

// export function ConnectionPanel() {
//     const navigate = useNavigate()
//     const { setUser } = useUser()
//     const formRef = useRef<HTMLFormElement>(null)
//     const [showPassword, setShowPassword] = useState(false)

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         const formData = new FormData(formRef.current!)
//         const name = formData.get("name")
//         const password = formData.get("password")

//         try {
//             const response = await fetch("http://localhost:3001/api/login", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ name, password }),
//             })

//             if (!response.ok) {
//                 toast.error("Ces identifiants ne correspondent à aucuns utilisateur connu.", {
//                     progressClassName: "fancy-progress-bar", closeOnClick: true, autoClose: 10000, theme: localStorage.getItem("theme") || "light"
//                 });
//                 return
//             }

//             const user = await response.json()

//             if (user.role === "ADMIN") {
//                 setUser(user)
//                 toast.success(
//                     <span>Connexion réussie. Bienvenue administrateur <strong>{user.name}</strong> 👋</span>, 
//                     { progressClassName: "fancy-progress-bar", closeOnClick: true, autoClose: 3000, theme: localStorage.getItem("theme") || "light" }
//                 )
//                 navigate("/ask")
//             } else {
//                 setUser(user)
//                 toast.success(
//                     <span>Connexion réussie. Bienvenue utilisateur <strong>{user.name}</strong> 👋</span>, 
//                     { progressClassName: "fancy-progress-bar", closeOnClick: true, autoClose: 3000, theme: localStorage.getItem("theme") || "light" }
//                 )
//                 navigate("/ask")
//             }
//         } catch (error) {
//             console.error("Erreur lors de la connexion :", error)
//         }
//     }

//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <Button className="hover:opacity-60 bg-black dark:bg-white text-white dark:text-black">
//                     Se connecter
//                 </Button>
//             </DialogTrigger>

//             <DialogContent className="sm:max-w-[475px] h-fit bg-white dark:bg-black">
//                 <form ref={formRef} onSubmit={handleSubmit}>
//                     <DialogHeader>
//                         <DialogTitle>Connexion</DialogTitle>
//                         <DialogDescription className="text-[#a1a1a1]">
//                             Votre code d'identification vous a normalement été communiqué. Si ce n'est pas le cas, merci de vous adresser à la DSI.
//                         </DialogDescription>
//                     </DialogHeader>

//                     <div className="grid gap-5 my-4">
//                         <div className="grid gap-3">
//                             <Label htmlFor="name-input">Identifiant</Label>
//                             <Input id="name-input" name="name" />
//                         </div>

//                         <div className="grid gap-3 relative">
//                             <Label htmlFor="password-input">Mot de passe</Label>
//                             <Input
//                                 id="password-input"
//                                 name="password"
//                                 type={showPassword ? "text" : "password"}
//                                 className="pr-10"
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => setShowPassword((prev) => !prev)}
//                                 className="absolute right-3 top-[33px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
//                                 tabIndex={-1}
//                             >
//                                 {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                             </button>
//                         </div>
//                     </div>

//                     <DialogFooter>
//                         <DialogClose asChild>
//                             <Button
//                                 type="button"
//                                 className="hover:opacity-60 outline-black dark:outline-white text-black dark:text-white"
//                                 style={{ outlineWidth: "0.15rem", outlineOffset: "-1px" }}
//                             >
//                                 Annuler
//                             </Button>
//                         </DialogClose>
//                         <Button
//                             type="submit"
//                             className="hover:opacity-60 bg-black dark:bg-white text-white dark:text-black"
//                         >
//                             Se connecter
//                         </Button>
//                     </DialogFooter>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     )
// }
