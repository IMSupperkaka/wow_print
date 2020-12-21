import React from 'react'
import { Canvas } from '@tarojs/components'

export default (Camp) => {
    return (props) => {
        return (
            <>
                <Canvas canvasId="compress-canvas" style={{ width: 2000, height: 2000, position: 'fixed', left: 9999, top: 9999 }}/>
                <Camp {...props}/>
            </>
        )
    }
}