import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import PressOutView, { PressOutViewRef } from './core/views/PressOutView';
import CategoryPickerDropdown from './CategoryPickerDropdown';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import BlurView from './core/wrappers/BlurView';
import { colorTheme } from '../src/GlobalStyles';
import { StyleSheet } from 'react-native';
import { deleteCategoryAndBackup, restoreCategoryFromBackup } from '../src/helpers/CategoriesHelpers';
import { EventRegister } from 'react-native-event-listeners';
import { useAppDispatch } from '../src/redux/hooks';

export type FloatingCategoryPickerRef = {
    /**
     * Opens the floating category input.
     */
    open: (() => void);
}

type FloatingCategoryPickerProps = {
    /**
     * Called when the user chooses a category.
     * 
     * Should be used to update an event's category.
     */
    onCategorySelected: ((categoryId: string | null) => void);
}

const FloatingCategoryPicker = forwardRef<CategoryInputRef, FloatingCategoryPickerProps>((props, ref) => {
    const dispatch = useAppDispatch();

    const pressOutViewRef = useRef<PressOutViewRef | null>(null);
    const categoryInputRef = useRef<CategoryInputRef | null>(null);

    useImperativeHandle(ref, () => ({
        open() {
            pressOutViewRef.current?.open();
        },
    }));
    
    function onCategoryInputSubmitted(categoryID: string, mode: "create" | "edit") {
        if (mode === 'create') {
            onCategorySelected(categoryID);
        }
    }

    function deleteCategory(categoryID: string) {
        deleteCategoryAndBackup(dispatch, categoryID);
        EventRegister.emit('showUndoPopup', { action: 'Category Deleted', onPressed: ()=>{restoreCategoryFromBackup(dispatch)} });
    }

    function onCategorySelected(categoryId: string | null) {
        props.onCategorySelected(categoryId);
        pressOutViewRef.current?.close();
    }
    
    return (
        <>
            <PressOutView ref={pressOutViewRef}>
                <BlurView
                    borderRadius={20}
                    blurType={colorTheme}
                    style={styles.mainContainer}
                    onStartShouldSetResponder={() => true} // Absorb touch events. This prevents event input from closing when box is tapped
                >
                    <CategoryPickerDropdown
                        onCategorySelected={onCategorySelected}
                        onEditCategory={(categoryId) => categoryInputRef.current?.open({mode: 'edit', categoryID: categoryId})}
                        onCreateCategory={() => categoryInputRef.current?.open({mode: 'create'})}
                    />
                </BlurView>
            </PressOutView>
            <CategoryInput ref={categoryInputRef} onSubmit={onCategoryInputSubmitted} onDelete={deleteCategory}/>
        </>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#2228',
        width: 200,
        height: 300
    }
});

export default FloatingCategoryPicker;