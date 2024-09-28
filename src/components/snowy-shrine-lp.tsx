'use client'

import React, { useEffect, useRef } from 'react'

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
}

export default function SnowyShrineLp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snowflakesRef = useRef<Snowflake[]>([])
  const mouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create initial snowflakes
    snowflakesRef.current = Array.from({ length: 200 }, createSnowflake)

    // Animation loop
    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw mouse circle
      ctx.beginPath()
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 100, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fill()

      snowflakesRef.current = snowflakesRef.current.map(updateSnowflake)
      snowflakesRef.current.forEach(drawSnowflake)

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  function createSnowflake(): Snowflake {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
    }
  }

  function updateSnowflake(snowflake: Snowflake): Snowflake {
    const canvas = canvasRef.current
    if (!canvas) return snowflake

    // Update snowflake position
    snowflake.y += snowflake.speed
    snowflake.x += Math.sin(snowflake.y * 0.01) * 0.5

    // Wrap snowflakes around screen
    if (snowflake.y > canvas.height) {
      snowflake.y = -10
      snowflake.x = Math.random() * canvas.width
    }
    if (snowflake.x > canvas.width) {
      snowflake.x = 0
    } else if (snowflake.x < 0) {
      snowflake.x = canvas.width
    }

    // Avoid mouse
    const dx = snowflake.x - mouseRef.current.x
    const dy = snowflake.y - mouseRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 100) {
      const angle = Math.atan2(dy, dx)
      const pushDistance = (100 - distance) / 2
      snowflake.x += Math.cos(angle) * pushDistance
      snowflake.y += Math.sin(angle) * pushDistance
    }

    return snowflake
  }

  function drawSnowflake(snowflake: Snowflake) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2)
    ctx.fill()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseLeave = () => {
    mouseRef.current = { x: -100, y: -100 }
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/snowy-shrine.jpg")',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Winter at the Shrine</h1>
        <p className="text-xl mb-8">Experience the serenity of a snowy Japanese shrine</p>
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Explore Now
        </button>
      </div>
    </div>
  )
}