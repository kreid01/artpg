import * as Toast from "@radix-ui/react-toast";

interface ToastProps {
  setOpenToast: any;
  openToast: boolean;
  toastData: any 
}

export const CompleteToast: React.FC<ToastProps> = ({
  openToast,
  setOpenToast,
  toastData,
}) => {
  return (
    <>
      <Toast.Root
        open={openToast}
        onOpenChange={setOpenToast}
        className="
    fixed
    bottom-6
    right-6
    w-85
    overflow-hidden
    rounded-xl
    border
    border-[#8d6d2c]
    bg-linear-to-b
    from-[#1b2027]
    via-[#171c22]
    to-[#101419]
    shadow-[0_0_30px_rgba(0,0,0,.6)]
    animate-in
    slide-in-from-right
    duration-300
  "
      >
        <div className="h-1 w-full bg-linear-to-r from-amber-700 via-yellow-400 to-amber-700" />
        <div className="flex items-start gap-4 p-4">
          <div className="flex-1">
            <Toast.Title className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Quest Complete
            </Toast.Title>

            <p className="mt-1 text-base font-semibold text-white">
              {toastData?.title}
            </p>

            {toastData?.description && (
              <Toast.Description className="mt-1 text-sm text-slate-400">
                {toastData.description}
              </Toast.Description>
            )}
          </div>
        </div>
      </Toast.Root>

      <Toast.Viewport
        className="
    fixed
    bottom-0
    right-0
    z-50
    flex
    w-90
    max-w-full
    flex-col
    gap-3
    p-6
  "
      />
    </>
  );
};
