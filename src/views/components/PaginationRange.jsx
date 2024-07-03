import React, {useMemo} from 'react';

export const DOTS = '...';

const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({length}, (_, idx) => idx + start);
};

export const usePagination =
    ({
         numberPage,
         siblingCount = 1,
         activeNumberPage,
     }) => {

        return useMemo(() => {
            const totalPageCount = numberPage;


            const totalPageNumbers = siblingCount + 5;


            if (totalPageNumbers >= totalPageCount) {
                return range(1, totalPageCount);
            }

            const leftSiblingIndex = Math.max(activeNumberPage - siblingCount, 1);
            const rightSiblingIndex = Math.min(
                activeNumberPage + siblingCount,
                totalPageCount
            );


            const shouldShowLeftDots = leftSiblingIndex > 2;
            const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

            const firstPageIndex = 1;
            const lastPageIndex = totalPageCount;

            if (!shouldShowLeftDots && shouldShowRightDots) {
                let leftItemCount = 3 + 2 * siblingCount;
                let leftRange = range(1, leftItemCount);

                return [...leftRange, DOTS, totalPageCount];
            }

            if (shouldShowLeftDots && !shouldShowRightDots) {
                let rightItemCount = 3 + 2 * siblingCount;
                let rightRange = range(
                    totalPageCount - rightItemCount + 1,
                    totalPageCount
                );
                return [firstPageIndex, DOTS, ...rightRange];
            }

            if (shouldShowLeftDots && shouldShowRightDots) {
                let middleRange = range(leftSiblingIndex, rightSiblingIndex);
                return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
            }
        }, [numberPage, siblingCount, activeNumberPage]);
    };

