export const FLY_TO_CART_EVENT = "panaderia:fly-to-cart";

export type FlyToCartDetail = {
  from: { x: number; y: number };
  categoria: string;
};

export function dispatchFlyToCart(from: { x: number; y: number }, categoria: string) {
  window.dispatchEvent(
    new CustomEvent<FlyToCartDetail>(FLY_TO_CART_EVENT, {
      detail: { from, categoria },
    })
  );
}
