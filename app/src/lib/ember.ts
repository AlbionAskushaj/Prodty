/** The ember that flies from a finished task's blossom to the lantern. */

type Point = { x: number; y: number }

function centre(element: Element, frame: DOMRect): Point {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2 - frame.left, y: box.top + box.height / 2 - frame.top }
}

/** Points along an arc that rises above both ends. */
function arc(from: Point, to: Point, steps: number): Point[] {
  const lift = Math.min(160, 60 + Math.hypot(to.x - from.x, to.y - from.y) * 0.35)
  const peak = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - lift }
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const a = (1 - t) ** 2
    const b = 2 * (1 - t) * t
    const c = t ** 2
    return { x: a * from.x + b * peak.x + c * to.x, y: a * from.y + b * peak.y + c * to.y }
  })
}

const FLIGHT_MS = 1050

/** Resolves when the ember lands. Resolves at once if there is nothing to fly from or to. */
export function flyEmber(app: HTMLElement, taskId: string, delay = 0): Promise<void> {
  const from = app.querySelector(`[data-task="${CSS.escape(taskId)}"]`)
  const to = app.querySelector('.lantern-target')
  if (!from || !to) return Promise.resolve()
  const frame = app.getBoundingClientRect()
  const path = arc(centre(from, frame), centre(to, frame), 14)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()

  return new Promise((resolve) => {
    const flights = [0, 60, 120, 180].map((lag, n) => {
      const ember = document.createElement('i')
      ember.className = n === 0 ? 'flying-ember' : 'flying-ember trail'
      app.appendChild(ember)
      const flight = ember.animate(
        path.map((point, i) => ({
          transform: `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) scale(${
            n === 0 ? 1 - (i / path.length) * 0.35 : 0.6 - n * 0.12
          })`,
          opacity: i === 0 || i >= path.length - 1 ? 0 : n === 0 ? 1 : 0.55 - n * 0.12,
        })),
        { duration: FLIGHT_MS, delay: delay + lag, easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'both' },
      )
      void flight.finished.catch(() => undefined).then(() => ember.remove())
      return flight
    })
    void flights[0].finished.catch(() => undefined).then(() => resolve())
  })
}
