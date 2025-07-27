import React from 'react';
import { Image } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const logo = require('../assets/images/adaptive-icon.png');

export default function ImageSkeleton({ width, height, style, visible }) {
  return (
    <SkeletonPlaceholder enabled={visible}>
      <SkeletonPlaceholder.Item width={width} height={height} style={style}>
        <Image
          source={logo}
          style={{ width, height, opacity: 0.5 }}
          resizeMode="contain"
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
}
