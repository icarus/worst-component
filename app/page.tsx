"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [timerProgress, setTimerProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current || isOpen) return

      const buttonRect = buttonRef.current.getBoundingClientRect()
      const buttonCenterX = buttonRect.left + buttonRect.width / 2
      const buttonCenterY = buttonRect.top + buttonRect.height / 2

      const distanceX = e.clientX - buttonCenterX
      const distanceY = e.clientY - buttonCenterY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      // Move button away only when mouse is close enough
      if (distance < 200) {
        const moveX = distanceX > 0 ? -20 : 20
        const moveY = distanceY > 0 ? -20 : 20

        // Keep button within viewport boundaries
        const newX = Math.max(10, Math.min(90, position.x + moveX))
        const newY = Math.max(10, Math.min(90, position.y + moveY))

        setPosition({ x: newX, y: newY })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [position, isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout
    let animationTimer: NodeJS.Timeout

    if (isOpen) {
      setTimerProgress(0)

      // Update progress every 30ms for smooth animation
      animationTimer = setInterval(() => {
        setTimerProgress(prev => {
          const newProgress = prev + (100 / (1000 / 30))
          return newProgress > 100 ? 100 : newProgress
        })
      }, 30)

      timer = setTimeout(() => {
        setIsOpen(false)
      }, 1000)
    } else {
      setTimerProgress(0)
    }

    return () => {
      clearTimeout(timer)
      clearInterval(animationTimer)
    }
  }, [isOpen])

  const handleSuccess = () => {
    setIsOpen(false)
    setShowSuccess(true)
  }

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] relative">
       {showSuccess ? (
         <div className="fixed inset-0 flex items-center justify-center bg-green-100 z-50">
           <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
             <h2 className="text-3xl font-bold text-green-600 mb-4">¡Éxito!</h2>
             <p className="text-lg mb-6">Felicidades por superar esta horrible experiencia de usuario.</p>
             <Button onClick={() => setShowSuccess(false)}>Volver al inicio</Button>
           </div>
         </div>
       ) : (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                ref={buttonRef}
                variant="default"
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'left 0.2s, top 0.2s',
                }}
                onClick={() => setIsOpen(true)}
              >
                Haz click aquí
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="flex flex-col gap-2 items-center justify-center">
                <DialogTitle className="text-2xl">¡Atención!</DialogTitle>
                <DialogDescription>
                  ¿Seguro que quieres apretar este botón?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="justify-between gap-2">
                <div className="relative w-full rounded-md overflow-clip">
                  <Button type="button" onClick={() => setIsOpen(false)} className="w-full bg-black/70">
                    Cerrar
                  </Button>
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-black opacity-50 mix-blend-overlay pointer-events-none"
                    style={{
                      width: `${timerProgress}%`,
                      transition: 'width 30ms linear'
                    }}
                  />
                </div>
                <Button variant="outline" onClick={handleSuccess}>
                  Continuar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
       )}
    </div>
  );
}
