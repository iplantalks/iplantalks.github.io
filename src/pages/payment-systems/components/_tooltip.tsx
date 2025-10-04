import * as React from 'react'
import { ReactNode, useState } from 'react'

export type Direction = 'left' | 'right'

export const TooltipIcon = ({ tooltip, icon, className, direction = 'left', width = 200 }: { tooltip: string; className?: string; direction?: Direction, width?: number, icon?: ReactNode }) => {
  const [visible, setVisible] = useState(false)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <span className='relative' onClick={() => isMobile && setVisible(!visible)} onMouseEnter={() => !isMobile && setVisible(true)} onMouseLeave={() => !isMobile && setVisible(false)}>
      {icon ? icon : <i className={className} />}
      {visible && <div className="absolute small p-2 bg-neutral-50 border border-neutral-200 rounded z-2" style={{ top: '100%', left: direction === 'left' ? '0%' : 'auto', right: direction === 'right' ? '0%' : 'auto', marginBottom: 0, marginTop: '1em', width: `${width}px` }}>{tooltip}</div>}
    </span>
  )


}
