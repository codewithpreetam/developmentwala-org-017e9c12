export function createPageUrl(pageName: string) {
  if (pageName === "Home") return "/";
  return (
    "/" +
    pageName
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/ /g, "-")
      .toLowerCase()
  );
}