import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";

const CHART_HEIGHT = 120;

type Props = { 
    elevations: number[];
    width: number;
};

export default function ElevationChart({ elevations, width}: Props) {
    if (!elevations || elevations.length < 2)
        return null;

    const min = Math.min(...elevations);
    const max = Math.max(...elevations);
    const range = Math.max(max - min, 1);

    const points = elevations
        .map((elev, i) => {
            const x = (i / (elevations.length - 1)) * width;
            const y = CHART_HEIGHT - ((elev - min) / range) * (CHART_HEIGHT - 20) - 10;
            return `${x}, ${y}`;
        })
        .join(" ");
    
    return (
        <View style={styles.container}>
            <Svg width={width} height={CHART_HEIGHT}>
                <Line x1="0" y1={CHART_HEIGHT - 10} x2={width} y2={CHART_HEIGHT - 10} stroke="#ddd" strokeWidth="1" />
                <Polyline points={points} fill="none" stroke="#2E8B57" strokeWidth="2.5" />
                <SvgText x="4" y="14" fontSize="11" fill="#666"> {Math.round(max)}m </SvgText>
                <SvgText x="4" y={CHART_HEIGHT - 14} fontSize="11" fill="#666"> {Math.round(min)}m </SvgText>
            </Svg>
        </View>
    )
} // end of elevationChart

const styles = StyleSheet.create({
    container: { 
        backgroundColor: "#fafafa", 
        borderRadius: 8, 
        paddingVertical: 4
    }, 
});