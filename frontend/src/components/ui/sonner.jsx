import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-800 group-[.toaster]:text-white group-[.toaster]:border-slate-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-600 group-[.toast]:text-white",
        },
      }}
      {...props} />
  );
}

export { Toaster }
