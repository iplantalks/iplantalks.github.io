import * as React from 'react'
import { useState } from 'react'

export type Direction = 'left' | 'right'

export const TooltipIcon = ({ tooltip, className, direction = 'left', width = 200 }: { tooltip: string; className: string; direction?: Direction, width?: number }) => {
  const [visible, setVisible] = useState(false)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <span className='position-relative' onClick={() => isMobile && setVisible(!visible)} onMouseEnter={() => !isMobile && setVisible(true)} onMouseLeave={() => !isMobile && setVisible(false)}>
      <i className={className} />
      {visible && <div className="position-absolute small p-2 alert alert-light z-2" style={{ top: '100%', left: direction === 'left' ? '0%' : 'auto', right: direction === 'right' ? '0%' : 'auto', marginBottom: 0, marginTop: '1em', width: `${width}px` }}>{tooltip}</div>}
    </span>
  )


}
