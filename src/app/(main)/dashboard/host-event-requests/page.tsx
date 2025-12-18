import { HostEventRequestsTable } from "./_components/host-event-requests-table";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <HostEventRequestsTable />
    </div>
  );
}
