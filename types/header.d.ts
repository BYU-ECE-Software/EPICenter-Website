export type Url = string | URL;

declare global {
  type HeaderProps = {
    title: string;
    subtitle?: string;
    breadcrumbs?: Array;
    rightItems?: Array;
    navLinks?: Array;
  };
  type BreadcrumbProps = {
    text: string;
    href: Url;
    last?: boolean;
  };
  type NavLinkProps = {
    text: string;
    href: Url;
  };
}
