export function Loader({ size = "md" }) {
  return (
    <div className="w-screen h-screen">
        <div
        className={`w-10 h-10 animate-spin mx-auto mt-[50vh] rounded-full border-2 border-current border-t-transparent text-blue-500`}
        role="status"
        aria-label="Loading"
        />
    </div>
  )
}