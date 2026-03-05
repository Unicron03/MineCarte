"use client";

import React, { useRef, useEffect } from 'react';

const ANIMATION_INTERVAL = 100; // in milliseconds. Higher value = slower animation.

const Lightning = ({ className }: { className?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        let animationTimeoutId: number;
        const strike = (x1: number, y1: number, x2: number, y2: number, color1: string, color2: string, drawOrbs?: boolean) => {
            const x = x2 - x1;
            const y = y2 - y1;
            const segments = 20; // Increased for more detail
            const distance = Math.sqrt(x * x + y * y);
            const width = distance / segments;
            let prevX = x1;
            let prevY = y1;

            if (drawOrbs) {
                context.strokeStyle = color1;
                context.fillStyle = color1;
                context.lineWidth = 1;
                context.beginPath();
                context.arc(x1, y1, 5 + (Math.random() * 2), 0, 2 * Math.PI, false);
                context.fill();
            }

            for (let i = 0; i <= segments; i++) {
                const magnitude = (width * i) / distance;
                let x3 = magnitude * x2 + (1 - magnitude) * x1;
                let y3 = magnitude * y2 + (1 - magnitude) * y1;

                if (i !== 0 && i !== segments) {
                    x3 += (Math.random() * width) - (width / 2);
                    y3 += (Math.random() * width) - (width / 2);
                }

                // Draw line
                context.strokeStyle = color1;
                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(prevX, prevY);
                context.lineTo(x3, y3);
                context.closePath();
                context.stroke();

                // Draw point
                context.strokeStyle = color1;
                context.fillStyle = color1;
                context.beginPath();
                context.arc(x3, y3, 2, 0, 2 * Math.PI, false);
                context.fill();

                // Draw line
                context.strokeStyle = color2;
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(prevX, prevY);
                context.lineTo(x3, y3);
                context.closePath();
                context.stroke();

                // Draw point
                context.strokeStyle = color2;
                context.fillStyle = color2;
                context.beginPath();
                context.arc(x3, y3, 1, 0, 2 * Math.PI, false);
                context.fill();
                prevX = x3;
                prevY = y3;
            }

            if (drawOrbs) {
                context.strokeStyle = color2;
                context.fillStyle = color2;
                context.lineWidth = 1;
                context.beginPath();
                context.arc(x2, y2, 5 + (Math.random() * 2), 0, 2 * Math.PI, false);
                context.fill();
            }
        };

        const render = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;
            const margin = 15;

            // Top border
            strike(margin, margin, w - margin, margin, "#557788", "#7799aa");
            strike(margin, margin, w - margin, margin, "#cfefff", "#ffffff", true);

            // Right border
            strike(w - margin, margin, w - margin, h - margin, "#557788", "#7799aa");
            strike(w - margin, margin, w - margin, h - margin, "#cfefff", "#ffffff", true);

            // Bottom border
            strike(w - margin, h - margin, margin, h - margin, "#557788", "#7799aa");
            strike(w - margin, h - margin, margin, h - margin, "#cfefff", "#ffffff", true);

            // Left border
            strike(margin, h - margin, margin, margin, "#557788", "#7799aa");
            strike(margin, h - margin, margin, margin, "#cfefff", "#ffffff", true);

            animationTimeoutId = window.setTimeout(render, ANIMATION_INTERVAL);
        };

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
            }
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);

            // Initial size setup
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
        render();

        return () => {
            clearTimeout(animationTimeoutId);

            if (canvas.parentElement) {
                resizeObserver.unobserve(canvas.parentElement);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className={className} style={{ width: '110%', height: '110%', position: 'absolute'}} />;

};

export default Lightning;