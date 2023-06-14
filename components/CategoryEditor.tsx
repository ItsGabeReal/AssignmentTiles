import React, {
    forwardRef,
    useRef,
    useImperativeHandle,
    useContext,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    FlatList,
    Alert,
    TouchableOpacity,
} from 'react-native';
import FloatingModal, { FloatingModalRef } from './core/FloatingModal';
import CategoryContext from '../context/CategoryContext';
import { Category } from '../types/EventTypes';
import Icon from 'react-native-vector-icons/Ionicons';
import EventsContext from '../context/EventsContext';
import CategoryInput, { CategoryInputRef } from './CategoryInput';

export type CategoryEditorRef = {
    open: (() => void);
}

type CategoryEditorProps = {

}

const CategoryEditor = forwardRef<CategoryEditorRef, CategoryEditorProps>((props, ref) => {
    const categoryContext = useContext(CategoryContext);
    
    const floatingModalRef = useRef<FloatingModalRef | null>(null);

    useImperativeHandle(ref, () => ({
        open() {
            floatingModalRef.current?.open();
        }
    }));

    return (
        <FloatingModal ref={floatingModalRef} style={styles.mainContainer}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Edit Categories:</Text>
            </View>
            <FlatList
                data={categoryContext.state}
                renderItem={({ item }) => <CategoryListItem category={item} />}
                ListEmptyComponent={() => {
                    return (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#8888', marginBottom: 5 }}>There are no categories.</Text>
                            <Button title='Create Category' />
                        </View>
                    )
                }}
                ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#8888' }} />}
            />
        </FloatingModal>
    )
});

type CategoryListItemProps = {
    category: Category;
}
const CategoryListItem: React.FC<CategoryListItemProps> = (props) => {
    const categoryContext = useContext(CategoryContext);
    const eventsContext = useContext(EventsContext);

    const categoryInputRef = useRef<CategoryInputRef | null>(null);

    function showDeletionConfirmation() {
        Alert.alert('Confirm', 'Are you sure you want to delete this category?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: () => deleteCategory(),
                style: 'destructive',
                isPreferred: true,
            },
        ], { cancelable: true, userInterfaceStyle: 'dark' })
    }

    function deleteCategory() {
        eventsContext.dispatch({ type: 'remove-category', categoryID: props.category.id });
        categoryContext.dispatch({ type: 'remove', categoryID: props.category.id });
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} mode='edit' editedCategory={props.category} />
            <TouchableOpacity onPress={() => categoryInputRef.current?.open()} style={styles.categoryListItemContainer}>
                <Text style={{ color: props.category.color, fontSize: 16, marginRight: 'auto' }}>{props.category.name}</Text>
                <TouchableOpacity onPress={showDeletionConfirmation} hitSlop={15}>
                    <Icon name='trash' color='red' size={20} />
                </TouchableOpacity>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        overflow: 'hidden',
        width: 250,
        height: 300,
        backgroundColor: '#222',
        borderRadius: 15,
        borderColor: '#888',
        borderWidth: StyleSheet.hairlineWidth,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        color: 'white',
        marginTop: 15,
        marginBottom: 20,
    },
    categoryListItemContainer: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
});

export default CategoryEditor;