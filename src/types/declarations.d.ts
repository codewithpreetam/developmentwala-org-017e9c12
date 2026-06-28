declare module "*.jsx" {
  const component: React.ComponentType<any> | any;
  export = component;
}

declare module "*.js" {
  const content: any;
  export = content;
  export default content;
}
