export function ProductCardSkeleton() {
  return (
    <div className="card bg-base-100 border border-base-200 overflow-hidden">
      <div className="skeleton h-72 w-full"/>
      <div className="card-body p-5 space-y-3">
        <div className="skeleton h-3 w-1/3"/>
        <div className="skeleton h-5 w-3/4"/>
        <div className="skeleton h-3 w-1/2"/>
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-6 w-10"/>
          <div className="skeleton h-6 w-10"/>
          <div className="skeleton h-6 w-10"/>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="skeleton h-6 w-24"/>
          <div className="skeleton h-10 w-10 rounded-full"/>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-14">
      <div className="skeleton h-[500px] w-full rounded"/>
      <div className="space-y-6">
        <div className="skeleton h-4 w-1/4"/>
        <div className="skeleton h-10 w-3/4"/>
        <div className="skeleton h-4 w-1/3"/>
        <div className="skeleton h-8 w-1/4"/>
        <div className="flex gap-2">
          <div className="skeleton h-8 w-16"/>
          <div className="skeleton h-8 w-16"/>
          <div className="skeleton h-8 w-16"/>
        </div>
        <div className="skeleton h-12 w-full"/>
      </div>
    </div>
  );
}