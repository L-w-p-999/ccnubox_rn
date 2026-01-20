import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';

import { ProgressProps } from './types';

/**
 * Progress 圆形进度条组件
 * 对进度条的二次封装，主要添加了：
 * - 默认样式配置（紫色主题 #7B71F1）
 * - 主题适配（深浅色模式）
 * - 自定义文字格式化功能
 *
 * @example
 * // 基础用法
 * <Progress percent={75} />
 *
 * // 自定义文字
 * <Progress percent={75} format={(p) => `${p}分`} />
 *
 * // 自定义样式
 * <Progress
 *   percent={75}
 *   size={120}
 *   strokeWidth={8}
 *   strokeColor="#52c41a"
 *   textStyle={{ fontSize: 24, fontWeight: 'bold' }}
 * />
 */
const Progress: React.FC<ProgressProps> = ({
  percent,
  type = 'circle',
  size = 80,
  strokeWidth = 13,
  strokeColor,
  trailColor,
  showText = true,
  format,
  textStyle,
  style,
  useTheme = false,
}) => {
  // 获取主题样式
  const { currentStyle, themeName } = useVisualScheme(
    ({ currentStyle, themeName }) => ({ currentStyle, themeName })
  );

  // 计算实际使用的颜色
  const actualStrokeColor = useMemo(() => {
    if (strokeColor) return strokeColor;
    return commonColors.purple as string;
  }, [strokeColor, useTheme, themeName]);

  const actualTrailColor = useMemo(() => {
    if (trailColor) return trailColor;
    if (useTheme) {
      return themeName === 'dark' ? '#333' : (commonColors.gray as string);
    }
    return commonColors.gray as string;
  }, [trailColor, useTheme, themeName]);

  // 计算圆形进度条参数
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // 格式化显示文字
  const displayText = useMemo(() => {
    if (!showText) return null;
    if (format) {
      return format(percent);
    }
    return `${percent}%`;
  }, [percent, showText, format]);

  // 文字颜色跟随主题
  const textColor = useMemo(() => {
    if (useTheme && currentStyle?.text_style?.color) {
      return currentStyle.text_style.color;
    }
    return themeName === 'dark' ? '#fff' : '#333';
  }, [useTheme, currentStyle, themeName]);

  if (type === 'circle') {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size}>
          {/* 轨道（背景圆环） */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={actualTrailColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 进度圆环 */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={actualStrokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* 中间文字 */}
        {showText && (
          <View style={styles.textContainer}>
            {typeof displayText === 'string' ? (
              <Text
                style={[
                  styles.text,
                  { fontSize: size * 0.2, color: textColor },
                  textStyle,
                ]}
              >
                {displayText}
              </Text>
            ) : (
              displayText
            )}
          </View>
        )}
      </View>
    );
  }

  // 线形进度条
  return (
    <View style={[styles.lineContainer, style]}>
      <View style={[styles.lineTrail, { backgroundColor: actualTrailColor }]}>
        <View
          style={[
            styles.lineProgress,
            {
              backgroundColor: actualStrokeColor,
              width: `${Math.min(percent, 100)}%`,
              height: strokeWidth,
            },
          ]}
        />
      </View>
      {showText && (
        <Text style={[styles.lineText, { color: textColor }, textStyle]}>
          {displayText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  lineTrail: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  lineProgress: {
    borderRadius: 3,
  },
  lineText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Progress;
export { ProgressProps } from './types';
