export function Status({ status }: { status: boolean }) {
  switch (status) {
    case true:
      return (
        <span className="inline-block max-w-32 text-center bg-green-100 text-green-600 font-bold text-xs rounded-lg px-2 py-1">
          Ativo
        </span>
      );
    case false:
      return (
        <span className="inline-block max-w-32 text-center bg-red-100 text-red-600 font-bold text-xs rounded-lg px-2 py-1">
          Inativo
        </span>
      );
  }
}