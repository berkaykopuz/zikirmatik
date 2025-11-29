import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.75;
const BEAD_COUNT = 33;
const RADIUS = RING_SIZE / 2;
const BEAD_RADIUS = RING_SIZE / 24; // Responsive bead size

type BeadCounterProps = {
    count: number;
    target: number;
    size?: number;
    strokeWidth?: number;
};

export function BeadCounter({ count, target, size, strokeWidth }: BeadCounterProps) {
    const ringSize = size || RING_SIZE;
    const radius = ringSize / 2;
    const beadRadius = ringSize / 24;

    const rotation = useSharedValue(0);

    useEffect(() => {
        // Calculate target rotation: each count rotates by (360 / BEAD_COUNT) degrees
        // We want the beads to move "down" or "clockwise" as we pull them
        const anglePerBead = 360 / BEAD_COUNT;
        const targetRotation = count * anglePerBead;

        rotation.value = withSpring(targetRotation, {
            mass: 0.5,
            damping: 15,
            stiffness: 120,
        });
    }, [count, rotation]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    // Generate beads positions
    const beads = Array.from({ length: BEAD_COUNT }).map((_, i) => {
        const angle = (i * 360) / BEAD_COUNT;
        const rad = (angle * Math.PI) / 180;
        // Position beads on the circle
        const x = radius + (radius - beadRadius) * Math.cos(rad);
        const y = radius + (radius - beadRadius) * Math.sin(rad);

        // Highlight every 11th bead (traditional tesbih markers)
        const isMarker = i % 11 === 0;

        return { x, y, isMarker, id: i };
    });

    return (
        <View style={[styles.container, { width: ringSize, height: ringSize }]}>
            {/* Static background ring/string */}
            <Svg width={ringSize} height={ringSize} style={styles.svg}>
                <Circle
                    cx={radius}
                    cy={radius}
                    r={radius - beadRadius}
                    stroke="#3a3d42"
                    strokeWidth={strokeWidth || 2}
                    fill="none"
                    opacity={0.5}
                />
            </Svg>

            {/* Rotating Beads Layer */}
            <Animated.View style={[styles.rotatingLayer, { width: ringSize, height: ringSize }, animatedStyle]}>
                {beads.map((bead) => (
                    <View
                        key={bead.id}
                        style={[
                            styles.bead,
                            {
                                left: bead.x - beadRadius,
                                top: bead.y - beadRadius,
                                width: beadRadius * 2,
                                height: beadRadius * 2,
                                borderRadius: beadRadius,
                                backgroundColor: bead.isMarker ? '#ffbf00' : '#e8ca8e',
                                // Add some 3D-ish effect with shadow/border
                                borderWidth: 1,
                                borderColor: bead.isMarker ? '#b38600' : '#c4a468',
                            },
                        ]}
                    >
                        {/* Simple highlight for 3D effect */}
                        <View style={styles.beadHighlight} />
                    </View>
                ))}
            </Animated.View>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: RING_SIZE,
        height: RING_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    svg: {
        position: 'absolute',
    },
    rotatingLayer: {
        width: RING_SIZE,
        height: RING_SIZE,
        position: 'absolute',
    },
    bead: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 4,
    },
    beadHighlight: {
        width: '40%',
        height: '40%',
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 99,
        position: 'absolute',
        top: '15%',
        left: '15%',
    },
    centerDisplay: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    countText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#e8ca8e',
        fontFamily: 'DSdigi',
        letterSpacing: 2,
    },
    targetText: {
        fontSize: 14,
        color: '#6f737a',
        marginTop: 4,
    },
});
