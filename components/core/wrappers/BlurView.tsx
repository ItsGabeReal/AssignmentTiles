/**
 * A wrapper for the BlurView component from @react-native-community/blur
 * that makes BlurViews more convienent to work with.
 * 
 * The main issue with the BlurView component is the style prop is very broken,
 * so this component wraps the BlurView in regular Views.
 * 
 * One view above (to handle border radius), and one view underneath (to contain content).
 */

import React from 'react';
import {
    View,
    ViewProps
} from 'react-native';
import { BlurView as _BlurView } from '@react-native-community/blur';

// Coppied from node_moduels/@react-native-community/blur/lib/typescript/components/BlurView.ios.d.ts
type BlurType = 'dark' | 'light' | 'xlight' | 'prominent' | 'regular' | 'extraDark' | 'chromeMaterial' | 'material' | 'thickMaterial' | 'thinMaterial' | 'ultraThinMaterial' | 'chromeMaterialDark' | 'materialDark' | 'thickMaterialDark' | 'thinMaterialDark' | 'ultraThinMaterialDark' | 'chromeMaterialLight' | 'materialLight' | 'thickMaterialLight' | 'thinMaterialLight' | 'ultraThinMaterialLight';

type BlurViewProps = ViewProps & {
    /**
     * Use this instead of style's border radius.
     * 
     * It must be this way because the BlurView component from
     * @react-native-community/blur does not display borderRadius correctly,
     * so there is a view above it with {overflow: hidden} that cuts off the
     * borders.
     */
    borderRadius?: number;

    blurAmount?: number;

    blurType?: BlurType;
}

const BlurView: React.FC<BlurViewProps> = (props) => {
    const { borderRadius, blurAmount, blurType, children, ...otherProps } = props;

    return (
        <View style={{borderRadius: borderRadius, overflow: 'hidden'}}>
            <_BlurView blurAmount={blurAmount} blurType={blurType}>
                <View {...otherProps}>
                    {children}
                </View>
            </_BlurView>
        </View>
    );
}

export default BlurView;
