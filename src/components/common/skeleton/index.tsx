import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../table";

export default function Skeleton() {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="ml-16 flex w-32 h-4 rounded-lg animate-pulse bg-pink-200" />
            </TableHead>
            <TableHead>
              <div className="flex w-32 h-4 rounded-lg animate-pulse bg-pink-200" />
            </TableHead>
            <TableHead>
              <div className="flex w-32 h-4 rounded-lg animate-pulse bg-pink-200" />
            </TableHead>
            <TableHead>
              <div className="flex w-32 h-4 rounded-lg animate-pulse bg-pink-200" />
            </TableHead>
            <TableHead></TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow
              className="border-b-4 border-transparent bg-pink-100 odd:bg-pink-50 overflow-hidden relative ring-inset ring-2 group rounded-lg ring-transparent hover:ring-pink-500 transition-none"
              key={index}
            >
              <TableCell>
                <div className="flex w-40 h-5 rounded-lg animate-pulse bg-pink-200" />
              </TableCell>
              <TableCell>
                <div className="flex w-40 h-5 rounded-lg animate-pulse bg-pink-200" />
              </TableCell>
              <TableCell>
                <div className="flex w-40 h-5 rounded-lg animate-pulse bg-pink-200" />
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
