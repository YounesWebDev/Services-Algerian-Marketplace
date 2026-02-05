import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PaginationLinkItem = {
  url: string | null;
  label: string;
  active: boolean;
};

export default function PaginationLinks({ links }: { links: PaginationLinkItem[] }) {
  if (!links?.length) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        {links.map((link, idx) => {
          const labelText = link.label
            .replace(/&laquo;|&raquo;/g, "")
            .replace(/&hellip;/g, "...")
            .replace(/&nbsp;/g, " ")
            .trim();

          const lowerLabel = labelText.toLowerCase();
          const isPrev = lowerLabel.includes("previous");
          const isNext = lowerLabel.includes("next");
          const isEllipsis = labelText === "..." || labelText === "…";

          if (isEllipsis) {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          if (!link.url) {
            return (
              <PaginationItem key={`disabled-${idx}`}>
                <span
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: isPrev || isNext ? "default" : "icon",
                    }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  {isPrev ? "Previous" : isNext ? "Next" : labelText}
                </span>
              </PaginationItem>
            );
          }

          if (isPrev) {
            return (
              <PaginationItem key={`prev-${idx}`}>
                <PaginationPrevious href={link.url} preserveScroll />
              </PaginationItem>
            );
          }

          if (isNext) {
            return (
              <PaginationItem key={`next-${idx}`}>
                <PaginationNext href={link.url} preserveScroll />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={`${link.url}-${idx}`}>
              <PaginationLink href={link.url} preserveScroll isActive={link.active}>
                {labelText}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </PaginationContent>
    </Pagination>
  );
}
