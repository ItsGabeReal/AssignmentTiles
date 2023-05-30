import React, { useState, useRef, forwardRef, useImperativeHandle, MutableRefObject } from 'react';
import ContextMenu, { ContextMenuDetails } from './ContextMenu';

export type ContextMenuContainerRef = {
    create: ((details: ContextMenuDetails) => void);

    close: (() => void);
}

type ContextMenuContainerProps = {
    ref?:
        | ((instance: ContextMenuContainerRef | null) => void)
        | MutableRefObject<ContextMenuContainerRef | null>
        | null
}

const defaultContextMenuDetails: ContextMenuDetails = {
    options: [],
    position: { x: 0, topY: 0, bottomY: 0 },
}

const ContextMenuContainer = forwardRef<ContextMenuContainerRef, ContextMenuContainerProps>((props, ref) => {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);

    const contextMenu_details = useRef(defaultContextMenuDetails);

    useImperativeHandle(ref, () => ({
        create(details: ContextMenuDetails) {
            contextMenu_details.current = details;
            setContextMenuVisible(true);
        },
        close() {
            setContextMenuVisible(false);
        }
    }));
    
    return (
        <ContextMenu
            visible={contextMenuVisible}
            details={contextMenu_details.current}
            onClose={() => setContextMenuVisible(false)}
        />
    );
}) as unknown;

export default ContextMenuContainer as ContextMenuContainerType;

type ContextMenuContainerType = (props: ContextMenuContainerProps) => React.ReactElement;