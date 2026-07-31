import { forwardRef } from "react";
import { FaXmark } from "react-icons/fa6";

export const CloseButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function CloseButton(props, ref) {
  return (
    <button
      ref={ref}
      {...props}
      className=" rounded-md text-md border border-[#8d6d2c] bg-linear-to-b from-[#2b2315] to-[#17130d] px-5 py-2.5 font-semibold text-amber-300 transition-all hover:border-amber-400 hover:text-white hover:shadow-[0_0_12px_rgba(255,190,70,.25)] " >
        <FaXmark/>
    </button>
  );
});