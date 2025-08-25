declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export type HTMLMotionProps<T> = any;
  export type MotionProps = any;
  export type Variants = any;
  export type Transition = any;
  export type Spring = any;
  export type Tween = any;
  export type Inertia = any;
  export type TargetAndTransition = any;
  export type AnimationControls = any;
  export function useAnimation(): any;
  export function useMotionValue(initial: any): any;
  export function useTransform(value: any, inputRange: any[], outputRange: any[]): any;
  export function useSpring(value: any, config?: any): any;
  export function useVelocity(value: any): any;
  export function useScroll(options?: any): any;
  export function useViewportScroll(): any;
  export function useElementScroll(ref: any): any;
  export function useCycle(...states: any[]): any;
  export function usePresence(): any;
  export function useIsPresent(): any;
  export function useReducedMotion(): any;
  export function useDragControls(): any;
  export function animate(from: any, to: any, options?: any): any;
}