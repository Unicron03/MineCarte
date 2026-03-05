"use client"

import { useEffect, useRef } from "react"

interface GoldenParticle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
    opacitySpeed: number
    color: string
    angle: number
    angleSpeed: number
    orbitRadius: number
    orbitX: number
    orbitY: number
    type: "star" | "sparkle" | "dot"
}

const GOLD_COLORS = [
    "#FFD700",
    "#FFC107",
    "#FFB300",
    "#FFCA28",
    "#FFE082",
    "#FFF176",
    "#F59E0B",
]

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, color: string) {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = size * 3
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const outerX = x + Math.cos(angle) * size
        const outerY = y + Math.sin(angle) * size
        const innerAngle = angle + (2 * Math.PI) / 10
        const innerX = x + Math.cos(innerAngle) * (size * 0.4)
        const innerY = y + Math.sin(innerAngle) * (size * 0.4)
        if (i === 0) ctx.moveTo(outerX, outerY)
        else ctx.lineTo(outerX, outerY)
        ctx.lineTo(innerX, innerY)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, color: string) {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.strokeStyle = color
    ctx.lineWidth = size * 0.3
    ctx.shadowColor = color
    ctx.shadowBlur = size * 4
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2
        ctx.beginPath()
        ctx.moveTo(x + Math.cos(angle) * size * 0.3, y + Math.sin(angle) * size * 0.3)
        ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size)
        ctx.stroke()
    }
    ctx.restore()
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, color: string) {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = size * 5
    ctx.beginPath()
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
}

export default function GoldenParticles({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<GoldenParticle[]>([])
    const animRef = useRef<number>(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const resize = () => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // Initialise les particules
        const count = 55
        particlesRef.current = Array.from({ length: count }, () => {
            const orbitRadius = 30 + Math.random() * (Math.max(canvas.width, canvas.height) * 0.55)
            const angle = Math.random() * Math.PI * 2
            const types: ("star" | "sparkle" | "dot")[] = ["star", "sparkle", "dot"]
            return {
                x: centerX + Math.cos(angle) * orbitRadius,
                y: centerY + Math.sin(angle) * orbitRadius,
                size: 1 + Math.random() * 3.5,
                speedX: 0,
                speedY: 0,
                opacity: 0.1 + Math.random() * 0.9,
                opacitySpeed: 0.005 + Math.random() * 0.015,
                color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
                angle,
                angleSpeed: (0.0003 + Math.random() * 0.0008) * (Math.random() > 0.5 ? 1 : -1),
                orbitRadius,
                orbitX: centerX + (Math.random() - 0.5) * 40,
                orbitY: centerY + (Math.random() - 0.5) * 40,
                type: types[Math.floor(Math.random() * types.length)],
            }
        })

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particlesRef.current.forEach(p => {
                // Orbite elliptique légèrement déformée
                p.angle += p.angleSpeed
                p.x = p.orbitX + Math.cos(p.angle) * p.orbitRadius
                p.y = p.orbitY + Math.sin(p.angle) * p.orbitRadius * 0.55

                // Scintillement
                p.opacity += p.opacitySpeed
                if (p.opacity > 1 || p.opacity < 0.05) {
                    p.opacitySpeed *= -1
                    // Change couleur au scintillement min
                    if (p.opacity < 0.05) {
                        p.color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)]
                    }
                }

                // Dessine selon le type
                if (p.type === "star") drawStar(ctx, p.x, p.y, p.size, p.opacity, p.color)
                else if (p.type === "sparkle") drawSparkle(ctx, p.x, p.y, p.size, p.opacity, p.color)
                else drawDot(ctx, p.x, p.y, p.size, p.opacity, p.color)
            })

            animRef.current = requestAnimationFrame(animate)
        }

        animate()

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)

        return () => {
            cancelAnimationFrame(animRef.current)
            observer.disconnect()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ pointerEvents: "none" }}
        />
    )
}
