import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/utils/cn";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

type JoinedPaginationProps = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
  onPageChange: (page: number) => void;
};

function JoinedPagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
  onPageChange,
}: JoinedPaginationProps) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  const handlePageChange = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const linkStyles = "px-3 py-2 text-sm rounded border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50 transition-colors cursor-pointer";
  const activeLinkStyles = "bg-blue-600 text-neutral-50 hover:bg-blue-700 border-blue-600";
  const disabledLinkStyles = "opacity-50 pointer-events-none cursor-not-allowed";
  const ellipsisStyles = "px-2 py-2 text-neutral-400 pointer-events-none";

  return (
    <Pagination>
      <PaginationContent className="inline-flex gap-1 rounded-lg bg-neutral-900">
        {/* Previous Button */}
        <PaginationItem>
          <PaginationLink
            className={cn(
              linkStyles,
              currentPage === 1 && disabledLinkStyles
            )}
            href="#"
            onClick={handlePageChange(currentPage - 1)}
            aria-label="Go to previous page"
            aria-disabled={currentPage === 1}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Left Ellipsis */}
        {showLeftEllipsis && (
          <PaginationItem>
            <span className={ellipsisStyles}>...</span>
          </PaginationItem>
        )}

        {/* Page Numbers */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              className={cn(
                linkStyles,
                page === currentPage && activeLinkStyles
              )}
              href="#"
              onClick={handlePageChange(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Right Ellipsis */}
        {showRightEllipsis && (
          <PaginationItem>
            <span className={ellipsisStyles}>...</span>
          </PaginationItem>
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationLink
            className={cn(
              linkStyles,
              currentPage === totalPages && disabledLinkStyles
            )}
            href="#"
            onClick={handlePageChange(currentPage + 1)}
            aria-label="Go to next page"
            aria-disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { JoinedPagination };
