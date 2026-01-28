import { ReviewsTable } from "./_components/reviews-table";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <ReviewsTable />
    </div>
  );
}
