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
import { RotateCcw } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [timerProgress, setTimerProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [viewportBounds, setViewportBounds] = useState({
    minX: 10, maxX: 90, minY: 10, maxY: 90
  })

  useEffect(() => {
    const updateViewportBounds = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth
        const buttonHeight = buttonRef.current.offsetHeight
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        const buttonWidthPercent = (buttonWidth / viewportWidth) * 100
        const buttonHeightPercent = (buttonHeight / viewportHeight) * 100

        const padding = 5
        setViewportBounds({
          minX: buttonWidthPercent / 2 + padding,
          maxX: 100 - (buttonWidthPercent / 2 + padding),
          minY: buttonHeightPercent / 2 + padding,
          maxY: 100 - (buttonHeightPercent / 2 + padding)
        })
      }
    }

    updateViewportBounds()
    window.addEventListener('resize', updateViewportBounds)
    return () => window.removeEventListener('resize', updateViewportBounds)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current || isOpen) return

      const buttonRect = buttonRef.current.getBoundingClientRect()
      const buttonCenterX = buttonRect.left + buttonRect.width / 2
      const buttonCenterY = buttonRect.top + buttonRect.height / 2

      const distanceX = e.clientX - buttonCenterX
      const distanceY = e.clientY - buttonCenterY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      const repulsionDistance = 300
      if (distance < repulsionDistance) {
        const repulsionFactor = 1 - (distance / repulsionDistance)
        const maxMoveAmount = 80
        const moveAmount = maxMoveAmount * repulsionFactor

        const dirX = distanceX / distance
        const dirY = distanceY / distance

        const moveX = -dirX * moveAmount
        const moveY = -dirY * moveAmount

        const newX = Math.max(viewportBounds.minX, Math.min(viewportBounds.maxX, position.x + moveX))
        const newY = Math.max(viewportBounds.minY, Math.min(viewportBounds.maxY, position.y + moveY))

        setPosition({ x: newX, y: newY })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [position, isOpen, viewportBounds])

  useEffect(() => {
    let timer: NodeJS.Timeout
    let animationTimer: NodeJS.Timeout

    if (isOpen) {
      setTimerProgress(0)

      animationTimer = setInterval(() => {
        setTimerProgress(prev => {
          const newProgress = prev + (100 / (650 / 30))
          return newProgress > 100 ? 100 : newProgress
        })
      }, 30)

      timer = setTimeout(() => {
        setIsOpen(false)
      }, 650)
    } else {
      setTimerProgress(0)
    }

    return () => {
      clearTimeout(timer)
      clearInterval(animationTimer)
    }
  }, [isOpen])

  // Prevent keyboard interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Escape key and other keyboard interactions
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSuccess = () => {
    setIsOpen(false)
    setShowSuccess(true)
  }

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] relative">
       {showSuccess ? (
         <div className="fixed inset-0 flex items-center justify-center bg-green-100 z-50">
           <div className="bg-white p-6 space-y-2 rounded-xl shadow-xl text-center max-w-md">
             <h2 className="text-2xl font-semibold">¡Éxito!</h2>
             <p className="text-base text-balance mb-6">Felicidades por superar esta horrible experiencia de usuario.</p>
             <Button variant="outline" onClick={() => setShowSuccess(false)} tabIndex={-1} onKeyDown={(e) => e.preventDefault()}>
                <RotateCcw />
                Volver intentar
              </Button>
           </div>
         </div>
       ) : (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onKeyDown={(e) => e.preventDefault()}>
              <Button
                ref={buttonRef}
                variant="default"
                tabIndex={-1}
                onKeyDown={(e) => e.preventDefault()}
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'left 0.1s, top 0.1s',
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
                  <Button type="button" onClick={() => setIsOpen(false)} className="w-full bg-black/70" tabIndex={-1} onKeyDown={(e) => e.preventDefault()}>
                    No (Quedan {Math.ceil((650 * (100 - timerProgress)) / 100 / 1000)}s)
                  </Button>
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-black opacity-50 mix-blend-overlay pointer-events-none"
                    style={{
                      width: `${timerProgress}%`,
                      transition: 'width 30ms linear'
                    }}
                  />
                </div>
                <Button variant="outline" onClick={handleSuccess} tabIndex={-1} onKeyDown={(e) => e.preventDefault()}>
                  Si
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
       )}
    </div>
  );
}
