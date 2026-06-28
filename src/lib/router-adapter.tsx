import * as React from "react";
import {
  Link as TanStackLink,
  useNavigate as useTanStackNavigate,
  useParams as useTanStackParams,
  useSearch as useTanStackSearch,
  useLocation as useTanStackLocation,
  type LinkProps,
} from "@tanstack/react-router";

export type RRLinkProps = {
  to?: string | { pathname?: string; search?: string | Record<string, string>; hash?: string };
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  replace?: boolean;
  state?: unknown;
  title?: string;
  target?: string;
  rel?: string;
  id?: string;
  "aria-label"?: string;
  "aria-current"?: string;
  style?: React.CSSProperties;
};

function parseTo(
  to: string | { pathname?: string; search?: string | Record<string, string>; hash?: string } | undefined
): Pick<LinkProps, "to" | "search" | "hash"> {
  if (!to) return { to: "." };

  if (typeof to === "string") {
    const clean = to.trim();
    const [pathAndSearch, hash] = clean.split("#") as [string, string | undefined];
    const [pathname, search] = pathAndSearch.split("?") as [string, string | undefined];
    return {
      to: pathname || "/",
      search: search ? parseSearchString(search) : undefined,
      hash: hash ? `#${hash}` : undefined,
    };
  }

  return {
    to: to.pathname || "/",
    search: typeof to.search === "string" ? parseSearchString(to.search) : to.search,
    hash: to.hash ? (to.hash.startsWith("#") ? to.hash : `#${to.hash}`) : undefined,
  };
}

function parseSearchString(search: string): Record<string, string> {
  const params: Record<string, string> = {};
  const trimmed = search.startsWith("?") ? search.slice(1) : search;
  if (!trimmed) return params;
  const url = new URLSearchParams(trimmed);
  url.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export const Link = React.forwardRef<HTMLAnchorElement, RRLinkProps>(
  ({ to, children, ...props }, ref) => {
    const { to: tanstackTo, search, hash } = parseTo(to);
    const tanstackProps: LinkProps = {
      to: tanstackTo,
      search,
      hash,
      ...props,
    } as unknown as LinkProps;
    return (
      <TanStackLink ref={ref} {...tanstackProps}>
        {children}
      </TanStackLink>
    );
  }
);
Link.displayName = "Link";

export function useNavigate() {
  const navigate = useTanStackNavigate();
  return React.useCallback(
    (
      to:
        | string
        | number
        | { pathname?: string; search?: string | Record<string, string>; hash?: string; state?: unknown },
      options?: { replace?: boolean; state?: unknown }
    ) => {
      if (typeof to === "number") {
        if (to < 0) return navigate({ to: ".", replace: options?.replace });
        return navigate({ to: ".", replace: options?.replace });
      }

      const { to: target, search, hash } = parseTo(to);
      return navigate({
        to: target,
        search,
        hash,
        replace: options?.replace,
        state: options?.state,
      });
    },
    [navigate]
  );
}

export function useParams() {
  return useTanStackParams({ strict: false }) as Record<string, string | undefined>;
}

export function useSearchParams() {
  const searchObj = useTanStackSearch({ strict: false });
  const navigate = useTanStackNavigate();

  const searchString = React.useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(searchObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    return params.toString();
  }, [searchObj]);

  const searchParams = React.useMemo(
    () => new URLSearchParams(searchString),
    [searchString]
  );

  const setSearchParams = React.useCallback(
    (
      next:
        | Record<string, string | number | undefined | null>
        | URLSearchParams
        | ((prev: URLSearchParams) => Record<string, string | number | undefined | null> | URLSearchParams),
      options?: { replace?: boolean }
    ) => {
      let resolved: Record<string, string | number | undefined | null> | URLSearchParams;
      if (typeof next === "function") {
        resolved = next(searchParams);
      } else {
        resolved = next;
      }

      const params = new URLSearchParams();
      if (resolved instanceof URLSearchParams) {
        resolved.forEach((value, key) => params.set(key, value));
      } else {
        Object.entries(resolved).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });
      }

      return navigate({
        to: ".",
        search: parseSearchString(params.toString()),
        replace: options?.replace,
      });
    },
    [navigate, searchParams]
  );

  return [searchParams, setSearchParams] as [URLSearchParams, typeof setSearchParams];
}

export function useLocation() {
  const location = useTanStackLocation();
  return {
    pathname: location.pathname,
    search: location.searchStr,
    hash: location.hash,
    state: location.state,
    key: location.state?.key ?? "default",
  };
}

export function useMatch(_pattern: string) {
  return null;
}

export { Outlet } from "@tanstack/react-router";
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
}

