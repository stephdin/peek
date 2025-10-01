import { JSX } from "@hono/hono/jsx/jsx-runtime";

type Props = {
  children: JSX.Element;
};

const Layout = (props: Props) => {
  return (
    <html>
      <head>
        <title>peek - git viewer</title>
        <link rel="stylesheet" href="./static/style.css" />
      </head>
      <body>{props.children}</body>
    </html>
  );
};

export default Layout;
