/**
 * ActivityShareCard Component
 * Custom designed card for high-quality activity sharing
 * Optimized aspect ratio and composition for social media
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../common';
import { StaticRouteMap } from '../map';
import { Activity, UnitSystem } from '../../types';
import {
    formatDistance,
    formatDuration,
    formatPace,
    formatDate,
} from '../../utils/formatting';
import { useTheme } from '../../hooks';
import { LinearGradient } from 'expo-linear-gradient';

interface ActivityShareCardProps {
    activity: Activity;
    units: UnitSystem;
}

const CARD_WIDTH = 1440; // Higher resolution for better quality
const CARD_HEIGHT = 2560; // Taller to include map with better quality

export const ActivityShareCard: React.FC<ActivityShareCardProps> = ({
    activity,
    units,
}) => {
    const { colors } = useTheme();

    const getActivityIcon = () => {
        return 'fitness';
    };

    const getActivityColor = () => {
        return colors.primary;
    };

    const getGradientColors = (): [string, string] => {
        return ['#667eea', '#764ba2'];
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.activityTypeContainer}>
                        <Ionicons
                            name={getActivityIcon() as any}
                            size={72}
                            color="#FFFFFF"
                        />
                        <Text variant="extraLarge" weight="bold" color="#FFFFFF" style={{ fontSize: 48 }}>
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Text>
                    </View>
                    <Text variant="regular" color="#FFFFFF" style={styles.dateText}>
                        {formatDate(activity.startTime, 'long')}
                    </Text>
                </View>
            </LinearGradient>

            {/* Main Stats - Large Display */}
            <View style={[styles.mainStats, { backgroundColor: colors.surface }]}>
                <View style={styles.primaryStat}>
                    <Ionicons name="navigate" size={56} color={getActivityColor()} />
                    <Text variant="extraLarge" weight="bold" color={colors.textPrimary} style={styles.primaryValue}>
                        {formatDistance(activity.distance, units, 2).split(' ')[0]}
                    </Text>
                    <Text variant="medium" color={colors.textSecondary} style={{ fontSize: 32 }}>
                        {formatDistance(activity.distance, units, 2).split(' ')[1]}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.primaryStat}>
                    <Ionicons name="time" size={56} color={getActivityColor()} />
                    <Text variant="extraLarge" weight="bold" color={colors.textPrimary} style={styles.primaryValue}>
                        {formatDuration(activity.duration)}
                    </Text>
                    <Text variant="medium" color={colors.textSecondary} style={{ fontSize: 32 }}>
                        Duration
                    </Text>
                </View>
            </View>

            {/* Secondary Stats Grid */}
            <View style={styles.secondaryStats}>
                <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                    <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
                        <Ionicons name="speedometer" size={40} color={colors.info} />
                    </View>
                    <Text variant="large" weight="bold" color={colors.textPrimary} style={{ fontSize: 36 }}>
                        {formatPace(activity.averagePace, units).split(' ')[0]}
                    </Text>
                    <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                        Avg Pace
                    </Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                    <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="footsteps" size={40} color={colors.primary} />
                    </View>
                    <Text variant="large" weight="bold" color={colors.textPrimary} style={{ fontSize: 36 }}>
                        {activity.steps.toLocaleString()}
                    </Text>
                    <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                        Steps
                    </Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: colors.background }]}>
                    <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
                        <Ionicons name="flame" size={40} color={colors.error} />
                    </View>
                    <Text variant="large" weight="bold" color={colors.textPrimary} style={{ fontSize: 36 }}>
                        {Math.round(activity.calories)}
                    </Text>
                    <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                        Calories
                    </Text>
                </View>
            </View>

            {/* Route Map */}
            {activity.route && activity.route.length > 0 && (
                <View style={styles.mapSection}>
                    <View style={styles.mapHeader}>
                        <Ionicons name="map" size={36} color={getActivityColor()} />
                        <Text variant="medium" weight="semiBold" color={colors.textPrimary} style={{ fontSize: 32 }}>
                            Your Route
                        </Text>
                    </View>
                    <View style={[styles.mapContainer, { backgroundColor: colors.background }]}>
                        <StaticRouteMap
                            route={activity.route}
                            units={units}
                            showDistanceMarkers={true}
                            showPaceHeatmap={true}
                            averagePace={activity.averagePace}
                        />
                    </View>
                    <View style={styles.mapInfo}>
                        <View style={styles.mapInfoItem}>
                            <Ionicons name="location" size={24} color={colors.textSecondary} />
                            <Text variant="extraSmall" color={colors.textSecondary} style={{ fontSize: 22 }}>
                                {activity.route.length} GPS points
                            </Text>
                        </View>
                        {activity.elevationGain !== undefined && activity.elevationGain > 0 && (
                            <View style={styles.mapInfoItem}>
                                <Ionicons name="trending-up" size={24} color={colors.textSecondary} />
                                <Text variant="extraSmall" color={colors.textSecondary} style={{ fontSize: 22 }}>
                                    +{activity.elevationGain.toFixed(0)}m elevation
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Performance Highlights */}
            <View style={styles.highlights}>
                <View style={[styles.highlightItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="trending-up" size={36} color={colors.success} />
                    <View style={styles.highlightText}>
                        <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                            Speed
                        </Text>
                        <Text variant="medium" weight="bold" color={colors.textPrimary} style={{ fontSize: 32 }}>
                            {((activity.distance / 1000) / (activity.duration / 3600)).toFixed(1)} {units === 'metric' ? 'km/h' : 'mph'}
                        </Text>
                    </View>
                </View>

                <View style={[styles.highlightItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="pulse" size={36} color={colors.info} />
                    <View style={styles.highlightText}>
                        <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                            Cadence
                        </Text>
                        <Text variant="medium" weight="bold" color={colors.textPrimary} style={{ fontSize: 32 }}>
                            {Math.round((activity.steps / activity.duration) * 60)} spm
                        </Text>
                    </View>
                </View>

                <View style={[styles.highlightItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="resize" size={36} color={colors.warning} />
                    <View style={styles.highlightText}>
                        <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                            Stride
                        </Text>
                        <Text variant="medium" weight="bold" color={colors.textPrimary} style={{ fontSize: 32 }}>
                            {((activity.distance / activity.steps) * 100).toFixed(0)} cm
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer Branding */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <View style={styles.brandingContainer}>
                    <Ionicons name="fitness" size={36} color={getActivityColor()} />
                    <Text variant="medium" weight="semiBold" color={colors.textPrimary} style={{ fontSize: 32 }}>
                        Stride
                    </Text>
                </View>
                <Text variant="small" color={colors.textSecondary} style={{ fontSize: 24 }}>
                    Track your progress, achieve your goals
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    header: {
        paddingHorizontal: 64,
        paddingVertical: 64,
    },
    headerContent: {
        alignItems: 'center',
    },
    activityTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 16,
    },
    dateText: {
        opacity: 0.9,
        fontSize: 28,
    },
    mainStats: {
        flexDirection: 'row',
        paddingHorizontal: 64,
        paddingVertical: 64,
    },
    primaryStat: {
        flex: 1,
        alignItems: 'center',
        gap: 16,
    },
    primaryValue: {
        fontSize: 96,
        lineHeight: 104,
    },
    divider: {
        width: 3,
        marginHorizontal: 32,
    },
    secondaryStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 48,
        gap: 32,
    },
    statBox: {
        width: '45%',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        gap: 12,
    },
    statIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    mapSection: {
        paddingHorizontal: 64,
        paddingVertical: 32,
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    mapContainer: {
        height: 700,
        borderRadius: 24,
        overflow: 'hidden',
    },
    mapInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        marginTop: 16,
    },
    mapInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    highlights: {
        paddingHorizontal: 64,
        paddingVertical: 32,
        gap: 24,
    },
    highlightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 28,
        gap: 20,
    },
    highlightText: {
        flex: 1,
    },
    footer: {
        marginTop: 'auto',
        paddingHorizontal: 64,
        paddingVertical: 48,
        borderTopWidth: 3,
        alignItems: 'center',
        gap: 12,
    },
    brandingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
});
