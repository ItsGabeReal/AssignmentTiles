import React, { useState, forwardRef, useImperativeHandle, MutableRefObject } from 'react';
import ContextMenu, { ContextMenuDetails } from './ContextMenu';

export type ContextMenuContainerRef = {
    /**
     * Opens the context menu and passes it the provided details.
     */
    create: ((details: ContextMenuDetails) => void);

    /**
     * Close the context menu.
     */
    close: (() => void);
}

type ContextMenuContainerProps = {
}

const emptyContextMenuDetails: ContextMenuDetails = {
    options: [],
    position: { x: 0, topY: 0, bottomY: 0 },
}

const ContextMenuContainer = forwardRef<ContextMenuContainerRef, ContextMenuContainerProps>((props, ref) => {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [menuDetails, setMenuDetails] = useState(emptyContextMenuDetails);

    useImperativeHandle(ref, () => ({
        create(details: ContextMenuDetails) {
            setMenuDetails(details);
            setContextMenuVisible(true);
        },
        close() {
            if (contextMenuVisible) setContextMenuVisible(false);
        }
    }));
    
    return (
        <ContextMenu
            visible={contextMenuVisible}
            details={menuDetails}
            onRequestClose={() => setContextMenuVisible(false)}
        />
    );
});

export default ContextMenuContainer;