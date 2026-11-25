import type { CSSProperties, ReactNode } from 'react'
import art from '../data/art.json'
import type { TreeColor } from '../state/types'

/** Scenes are laid out on a fixed grid of units and scaled to the screen with percentages. */
export const SCENE = { w: 1000, h: 1180 }

const TREE = art['tree-bare']
export const ANCHORS = TREE.anchors

/** The first few anchors are the most spread out, so tasks with tags go there. */
export const TASK_SLOTS = 8

export function sceneBox(left: number, top: number, width: number, aspect: number): CSSProperties {
  return {
    left: `${(left / SCENE.w) * 100}%`,
    top: `${(top / SCENE.h) * 100}%`,
    width: `${(width / SCENE.w) * 100}%`,
    aspectRatio: `${aspect}`,
  }
}

/** Place a sprite in a scene by the point where it touches the ground. */
export function standing(sprite: { w: number; h: number }, footX: number, footY: number, width: number): CSSProperties {
  const height = (width * sprite.h) / sprite.w
  return sceneBox(footX - width / 2, footY - height, width, sprite.w / sprite.h)
}

const LEAF_IMAGE: Record<TreeColor, string> = {
  rust: 'art/leaf-rust.webp',
  moss: 'art/leaf-moss.webp',
  gold: 'art/leaf-gold.webp',
  teal: 'art/leaf-moss.webp',
  rose: 'art/leaf-rust.webp',
  violet: 'art/leaf-rust.webp',
}

interface TreeSpriteProps {
  footX: number
  footY: number
  width: number
  onClick?: () => void
  label?: string
  children?: ReactNode
}

export function TreeSprite({ footX, footY, width, onClick, label, children }: TreeSpriteProps) {
  const height = (width * TREE.h) / TREE.w
  const style = {
    ...sceneBox(footX - TREE.foot.x * width, footY - TREE.foot.y * height, width, TREE.w / TREE.h),
    zIndex: Math.round(footY),
  }
  const content = (
    <>
      <img className="sprite" src="art/tree-bare.webp" alt="" draggable={false} />
      {children}
    </>
  )
  return onClick ? (
    <button type="button" className="tree" style={style} onClick={onClick} aria-label={label}>
      {content}
    </button>
  ) : (
    <div className="tree" style={style}>
      {content}
    </div>
  )
}

interface TreeItemProps {
  anchor: number
  /** Width as a share of the tree's width. */
  size: number
  kind: 'leaf' | 'blossom'
  color: TreeColor
  fresh?: boolean
  children?: ReactNode
}

/** A leaf or blossom fixed to one of the tree's anchor points. */
export function TreeItem({ anchor, size, kind, color, fresh, children }: TreeItemProps) {
  const point = ANCHORS[anchor % ANCHORS.length]
  const turn = ((anchor * 47) % 70) - 35
  return (
    <div className={`tree-item ${point.x < 0.22 ? 'edge-left' : point.x > 0.78 ? 'edge-right' : ''}`} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, width: `${size * 100}%` }}>
      <img
        className={`sprite ${kind === 'blossom' ? 'blossom' : `leaf leaf-${color}`} ${fresh ? 'fresh' : ''}`}
        style={{ rotate: `${kind === 'blossom' ? turn / 3 : turn}deg` }}
        src={kind === 'blossom' ? 'art/blossom.webp' : LEAF_IMAGE[color]}
        alt=""
        draggable={false}
      />
      {children}
    </div>
  )
}
