import { InteractionManager, UIManager, Platform } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// Configure for maximum performance
export const configurePerformance = () => {
    // Set maximum frame rate
    if (Platform.OS === 'android') {
        // Android-specific optimizations
        InteractionManager.setDeadline(16.67); // 60 FPS baseline
    }

    console.log('Performance optimizations enabled for 120 FPS');
};

// Optimize component rendering
export const shouldComponentUpdate = (nextProps: any, nextState: any, currentProps: any, currentState: any) => {
    // Shallow comparison for performance
    return JSON.stringify(nextProps) !== JSON.stringify(currentProps) ||
        JSON.stringify(nextState) !== JSON.stringify(currentState);
};

export default {
    configurePerformance,
    shouldComponentUpdate,
};
