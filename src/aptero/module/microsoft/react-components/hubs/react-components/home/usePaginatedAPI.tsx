import { useEffect, useState, useCallback, useRef } from "react";

export function usePaginatedAPI(apiCallback: any) {
  const curApiCallback = useRef(apiCallback);

  const [state, setState] = useState({
    isLoading: true,
    hasMore: false,
    results: [],
    suggestions: [],
    error: undefined,
    cursor: 0,
    nextCursor: undefined
  });

  const [internalState, setInternalState] = useState({ cursor: 0 });

  const loadMore = useCallback(() => {
    if (!state.nextCursor || state.isLoading) {
      console.warn("Can't load more results while results are already loading.");
      return;
    }

    setState((curState: any) => ({
      ...curState,
      cursor: state.nextCursor,
      nextCursor: undefined,
      isLoading: true,
      hasMore: false,
      error: undefined
    }));

    setInternalState({ cursor: state.nextCursor });
  }, [state.nextCursor, state.isLoading]);

  // Reset pagination state when paging callback changes
  useEffect(() => {
    if (curApiCallback.current === apiCallback) {
      return;
    }

    setState({
      isLoading: true,
      hasMore: false,
      results: [],
      suggestions: [],
      error: undefined,
      cursor: 0,
      nextCursor: undefined
    });

    curApiCallback.current = apiCallback;

    setInternalState({ cursor: 0 });
  }, [apiCallback]);

  useEffect(() => {
    const caller = curApiCallback.current;

    curApiCallback
      .current(internalState.cursor)
      .then((response: any) => {
        if (curApiCallback.current !== caller) {
          return;
        }

        setState((curState: any) => ({
          ...curState,
          isLoading: false,
          hasMore: !!response.meta.next_cursor,
          results: [...curState.results, ...response.entries],
          suggestions: response.suggestions,
          error: undefined,
          nextCursor: response.meta.next_cursor
        }));
      })
      .catch((error: Error) => {
        if (curApiCallback.current !== caller) {
          return;
        }

        setState((curState: any) => ({
          ...curState,
          isLoading: false,
          hasMore: false,
          results: curState.results,
          suggestions: [],
          error
        }));
      });
  }, [internalState]);

  return { ...state, loadMore };
}
