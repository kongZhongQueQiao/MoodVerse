declare module "framer-motion" {
  import type { ComponentType } from "react";

  export const motion: Record<string, ComponentType<any>>;
}

declare module "react-range" {
  import type { CSSProperties, ReactNode } from "react";

  export type TrackProps = {
    onMouseDown?: (event: unknown) => void;
    onTouchStart?: (event: unknown) => void;
    ref: (element: HTMLDivElement | null) => void;
    style?: CSSProperties;
  };

  export type ThumbProps = {
    key?: string;
    style?: CSSProperties;
    [key: string]: unknown;
  };

  export type RangeProps = {
    step: number;
    min: number;
    max: number;
    values: number[];
    onChange: (values: number[]) => void;
    renderTrack: (args: { props: TrackProps; children: ReactNode }) => ReactNode;
    renderThumb: (args: { props: ThumbProps }) => ReactNode;
  };

  export function getTrackBackground(params: {
    values: number[];
    colors: string[];
    min: number;
    max: number;
  }): string;

  export const Range: (props: RangeProps) => ReactNode;
}
