/**
 * Animation Configuration
 * Defines animation timings and spring configurations for react-native-reanimated
 */

export const AnimationTimings = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const SpringConfigs = {
  gentle: {
    damping: 20,
    stiffness: 90,
  },
  medium: {
    damping: 15,
    stiffness: 120,
  },
  bouncy: {
    damping: 10,
    stiffness: 100,
  },
  stiff: {
    damping: 20,
    stiffness: 300,
  },
};

export const AnimationPresets = {
  fadeIn: {
    duration: AnimationTimings.normal,
    easing: 'ease-in-out',
  },
  slideIn: {
    duration: AnimationTimings.normal,
    easing: 'ease-out',
  },
  scale: {
    duration: AnimationTimings.fast,
    easing: 'ease-in-out',
  },
};
